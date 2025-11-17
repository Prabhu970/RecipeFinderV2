import express from "express";
import { supabaseAdmin } from "./supabaseClient.js";  // ✅ fixed import
import { generateAIRecipe } from "./pythonClient.js";
import fetch from "node-fetch";

export const recipesRouter = express.Router();

/* ====================================================================== */
/* Utility mappers */
/* ====================================================================== */
function mapTags(row) {
  return (row.recipe_tags ?? [])
    .map((rt) => rt.tags?.name)
    .filter(Boolean);
}

function mapRecipeSummary(row) {
  return {
    id: row.id,
    title: row.title,
    imageUrl: row.image_url,
    cookTimeMinutes: row.cook_time_minutes,
    difficulty: row.difficulty,
    rating: row.rating,
    tags: mapTags(row),
    ingredients: row.ingredients?.map(i => i.name) ?? [],
  };
}

/* ====================================================================== */
/* Python LLM helper */
/* ====================================================================== */
async function isRecipeUnsafe(allergies, ingredients) {
  const res = await fetch(`${process.env.PYTHON_LLM_URL}/check-allergy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ allergies, ingredients }),
  });

  return res.json(); // { unsafe: boolean, reason: string }
}

/* ====================================================================== */
/* GET /recipes/recommended */
/* ====================================================================== */
recipesRouter.get("/recommended", async (req, res) => {
  try {
    const userId = req.headers["user-id"];
    if (!userId)
      return res.status(400).json({ error: "Missing user-id header" });

    // 1. Get recipes
    const { data: recipes, error } = await supabaseAdmin
      .from("recipes")
      .select(`
        id,
        title,
        description,
        image_url,
        cook_time_minutes,
        difficulty,
        rating,
        calories,
        ingredients ( name, quantity ),
        recipe_tags ( tags ( name ) )
      `);

    if (error) throw error;

    const mapped = recipes.map(mapRecipeSummary);

    // 2. Get user allergies
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("allergies")
      .eq("id", userId)
      .single();

    const allergies = profile?.allergies || "";

    // 3. Ask Python LLM to filter them
    const py = await fetch(
      `${process.env.PYTHON_LLM_URL}/filter-recipes-by-allergy`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allergies, recipes: mapped }),
      }
    );

    const result = await py.json();
    return res.json(result);
  } catch (err) {
    console.error("ERROR /recipes/recommended:", err);
    return res.status(500).json({ error: "Failed to load recommended" });
  }
});

/* ====================================================================== */
/* GET /recipes/search */
/* ====================================================================== */
recipesRouter.get("/search", async (req, res) => {
  try {
    const { q, diet, maxTime, allergies = "" } = req.query;

    let query = supabaseAdmin
      .from("recipes")
      .select(`
        id,
        title,
        description,
        image_url,
        cook_time_minutes,
        difficulty,
        rating,
        calories,
        ingredients ( name, quantity ),
        recipe_tags ( tags ( name ) )
      `);

    if (q) query = query.ilike("title", `%${q}%`);

    const { data, error } = await query.limit(100);
    if (error) throw error;

    let mapped = data.map(mapRecipeSummary);

    if (diet) {
      const lowDiet = diet.toLowerCase();
      mapped = mapped.filter((r) =>
        r.tags?.some((t) => t.toLowerCase() === lowDiet)
      );
    }

    if (maxTime) {
      mapped = mapped.filter(
        (r) => !r.cookTimeMinutes || r.cookTimeMinutes <= Number(maxTime)
      );
    }

    // allergy filtering
    const safe = [];
    const unsafe = [];

    for (const r of mapped) {
      const check = await isRecipeUnsafe(allergies, r.ingredients);
      if (check.unsafe) {
        unsafe.push({ ...r, unsafeReason: check.reason });
      } else {
        safe.push(r);
      }
    }

    res.json({ safe, unsafe });
  } catch (err) {
    console.error("ERROR /recipes/search:", err);
    res.status(500).send("Failed to search recipes");
  }
});

/* ====================================================================== */
/* GET /recipes/:id */
/* ====================================================================== */
recipesRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from("recipes")
      .select(`
        id,
        title,
        description,
        image_url,
        cook_time_minutes,
        difficulty,
        rating,
        calories,
        ingredients ( name, quantity ),
        steps ( step_number, instruction ),
        recipe_tags ( tags ( name ) )
      `)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).send("Recipe not found");

    res.json(mapRecipeSummary(data));
  } catch (err) {
    console.error("ERROR /recipes/:id:", err);
    res.status(500).send("Failed to load recipe detail");
  }
});

/* ====================================================================== */
/* POST /recipes/generate-ai */
/* ====================================================================== */
recipesRouter.post("/generate-ai", async (req, res) => {
  try {
    const out = await generateAIRecipe(req.body);
    res.json(out);
  } catch (err) {
    console.error("ERROR /recipes/generate-ai:", err);
    res.status(500).send("Failed to generate recipe");
  }
});
