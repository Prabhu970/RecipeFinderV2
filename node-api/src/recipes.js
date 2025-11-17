import express from "express";
import { supabaseAdmin, supabase } from "./supabaseClient.js";
import { generateAIRecipe } from "./pythonClient.js";
import fetch from "node-fetch";

export const recipesRouter = express.Router();

/* -------------------------- UTIL: MAP TAGS --------------------------- */
function mapTags(row) {
  return (row.recipe_tags ?? [])
    .map((rt) => rt.tags?.name)
    .filter(Boolean);
}

/* ----------------------- UTIL: SUMMARY MAPPER ------------------------ */
function mapRecipeSummary(row) {
  return {
    id: row.id,
    title: row.title,
    imageUrl: row.image_url,
    cookTimeMinutes: row.cook_time_minutes,
    difficulty: row.difficulty,
    rating: row.rating,
    tags: mapTags(row),
    ingredients: [], // added to avoid undefined in LLM calls
  };
}

/* ----------------------- UTIL: DETAIL MAPPER ------------------------- */
function mapRecipeDetail(row) {
  const tags = mapTags(row);

  const ingredients = (row.ingredients ?? []).map((ing) =>
    ing.quantity ? `${ing.quantity} ${ing.name}` : ing.name
  );

  const steps = (row.steps ?? [])
    .sort((a, b) => (a.step_number ?? 0) - (b.step_number ?? 0))
    .map((s) => s.instruction);

  return {
    id: row.id,
    title: row.title,
    imageUrl: row.image_url,
    cookTimeMinutes: row.cook_time_minutes,
    difficulty: row.difficulty,
    rating: row.rating,
    tags,
    ingredients,
    steps,
    servings: null,
    calories: row.calories,
  };
}

/* ---------------------- UTIL: PY LLM ALLERGY CHECK -------------------- */
async function isRecipeUnsafe(allergies, ingredients) {
  const res = await fetch(`${process.env.PYTHON_LLM_URL}/check-allergy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ allergies, ingredients }),
  });

  return await res.json(); // { unsafe: true/false, reason: "" }
}

/* ======================================================================= */
/*                          GET /recipes/recommended                       */
/* ======================================================================= */
recipesRouter.get("/recommended", async (req, res) => {
  try {
    const userId = req.headers["user-id"];

    if (!userId) {
      return res.status(400).json({ error: "Missing user-id header" });
    }

    // 1) Get all recipes
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
        recipe_tags ( tags ( name ) )
      `);

    if (error) throw error;

    const mapped = recipes.map(mapRecipeSummary);

    // 2) Fetch user allergies
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("allergies")
      .eq("id", userId)
      .single();

    const allergies = profile?.allergies || "";

    // 3) Send to Python LLM
    const py = await fetch(
      `${process.env.PYTHON_LLM_URL}/filter-recipes-by-allergy`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allergies, recipes: mapped }),
      }
    );

    const filtered = await py.json();
    return res.json(filtered);
  } catch (err) {
    console.error("Error in /recipes/recommended:", err);
    return res.status(500).json({ error: "Failed to load recommended recipes" });
  }
});

/* ======================================================================= */
/*                             GET /recipes/search                         */
/* ======================================================================= */
recipesRouter.get("/search", async (req, res) => {
  const { q, diet, maxTime, allergies = "" } = req.query;

  try {
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
        recipe_tags ( tags ( name ) )
      `);

    if (q) query = query.ilike("title", `%${q}%`);

    const { data, error } = await query.limit(100);
    if (error) throw error;

    let mapped = data.map(mapRecipeSummary);

    // diet filter
    if (diet) {
      const d = diet.toLowerCase();
      mapped = mapped.filter((r) => r.tags?.map(t => t.toLowerCase()).includes(d));
    }

    // time filter
    if (maxTime) {
      const max = Number(maxTime);
      mapped = mapped.filter(
        (r) => !r.cookTimeMinutes || r.cookTimeMinutes <= max
      );
    }

    /* Allergy check rewriting (no undefined variable) */
    const safe = [];
    const unsafe = [];

    for (const r of mapped) {
      const check = await isRecipeUnsafe(allergies, r.ingredients || []);
      if (check.unsafe) unsafe.push({ ...r, unsafeReason: check.reason });
      else safe.push(r);
    }

    return res.json({ safe, unsafe });
  } catch (err) {
    console.error("Error in /recipes/search:", err);
    return res.status(500).send("Failed to search recipes");
  }
});

/* ======================================================================= */
/*                          GET /recipes/:id                               */
/* ======================================================================= */
recipesRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
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

    return res.json(mapRecipeDetail(data));
  } catch (err) {
    console.error("Error in /recipes/:id:", err);
    return res.status(500).send("Failed to load recipe");
  }
});

/* ======================================================================= */
/*                        POST /recipes/generate-ai                        */
/* ======================================================================= */
recipesRouter.post("/generate-ai", async (req, res) => {
  try {
    const generated = await generateAIRecipe(req.body);
    return res.json(generated);
  } catch (err) {
    console.error("Error in /recipes/generate-ai:", err);
    return res.status(500).send("Failed to generate recipe");
  }
});
