import express from "express";
import { supabaseAdmin } from "./supabaseClient.js";
import fetch from "node-fetch";

export const recipesRouter = express.Router();

const PY_URL = process.env.PYTHON_LLM_URL;

// Check once on server start
if (!PY_URL) {
  console.error("❌ ERROR: PYTHON_LLM_URL is NOT SET in Render environment!");
} else {
  console.log("🔗 Python LLM URL:", PY_URL);
}

/* ------------------------------------------------------------------ */
/* Helpers */
/* ------------------------------------------------------------------ */

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
  };
}

function mapRecipeDetail(row) {
  const tags = mapTags(row);

  const ingredients = (row.ingredients ?? []).map((i) =>
    i.quantity ? `${i.quantity} ${i.name}` : i.name
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
    calories: row.calories,
  };
}

/* ------------------------------------------------------------------ */
/* GET /recipes/recommended */
/* ------------------------------------------------------------------ */

recipesRouter.get("/recommended", async (req, res) => {
  const userId = req.headers["user-id"];

  try {
    // 1️⃣ Load all recipes
    const { data: recipes, error: recipeError } = await supabaseAdmin
      .from("recipes")
      .select(`
        id,
        title,
        image_url,
        cook_time_minutes,
        difficulty,
        rating,
        calories,
        recipe_tags ( tags ( name ) )
      `);

    if (recipeError) throw recipeError;

    // 2️⃣ Load user allergies
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("allergies")
      .eq("id", userId)
      .single();

    const allergies = profile?.allergies ?? "";

    // 3️⃣ Send recipes + allergies to Python LLM
    const pyRes = await fetch(`${PY_URL}filter-recipes-by-allergy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allergies, recipes }),
    });

    const result = await pyRes.json();

    return res.json(result);
  } catch (err) {
    console.error("❌ ERROR /recipes/recommended:", err);
    return res.status(500).json({ error: "Failed to load recommended recipes" });
  }
});

/* ------------------------------------------------------------------ */
/* GET /recipes/search */
/* ------------------------------------------------------------------ */

recipesRouter.get("/search", async (req, res) => {
  const { q, diet, maxTime } = req.query;

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

    // Run base DB search
    const { data, error } = await query.limit(120);
    if (error) throw error;

    let recipes = (data ?? []).map(mapRecipeSummary);

    // Diet filter
    if (diet) {
      const d = diet.toLowerCase();
      recipes = recipes.filter((r) =>
        (r.tags ?? []).some((t) => t.toLowerCase() === d)
      );
    }

    // Max time filter
    if (maxTime) {
      const max = Number(maxTime);
      recipes = recipes.filter(
        (r) => !r.cookTimeMinutes || r.cookTimeMinutes <= max
      );
    }

    return res.json(recipes);
  } catch (err) {
    console.error("❌ ERROR /recipes/search:", err);
    return res.status(500).json({ error: "Failed to search recipes" });
  }
});

/* ------------------------------------------------------------------ */
/* GET /recipes/:id */
/* ------------------------------------------------------------------ */

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
    if (!data) return res.status(404).json({ error: "Recipe not found" });

    return res.json(mapRecipeDetail(data));
  } catch (err) {
    console.error("❌ ERROR /recipes/:id:", err);
    return res.status(500).json({ error: "Failed to load recipe" });
  }
});
