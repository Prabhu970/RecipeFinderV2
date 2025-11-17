import express from 'express';
import { supabaseAdmin } from "./supabaseClient.js";
import fetch from "node-fetch";

export const recipesRouter = express.Router();

const PY_URL = process.env.PYTHON_LLM_URL;

// Safety check
if (!PY_URL) {
  console.error("❌ PYTHON_LLM_URL is NOT SET! Python LLM calls will FAIL.");
}

// ---------------------------
// Helper functions
// ---------------------------
function mapTags(row) {
  return (row.recipe_tags ?? [])
    .map(rt => rt.tags?.name)
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
  const ingredients = (row.ingredients ?? []).map(i =>
    i.quantity ? `${i.quantity} ${i.name}` : i.name
  );
  const steps = (row.steps ?? [])
    .sort((a, b) => (a.step_number ?? 0) - (b.step_number ?? 0))
    .map(s => s.instruction);

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

// ---------------------------
// GET /recipes/recommended
// ---------------------------
recipesRouter.get("/recommended", async (req, res) => {

  const userId = req.headers["user-id"] || null;

  try {
    // 1) Load all recipes
    const { data: recipes, error } = await supabaseAdmin
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

    if (error) throw error;

    // 2) Load user profile
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("allergies")
      .eq("id", userId)
      .single();

    const allergies = profile?.allergies || "";

    // 3) Call Python correctly
    const py = await fetch(`${PY_URL}/filter-recipes-by-allergy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allergies, recipes }),
    });

    const result = await py.json();
    return res.json(result);

  } catch (err) {
    console.error("ERROR /recipes/recommended:", err.message);
    return res.status(500).json({ error: "Failed to load recommended recipes" });
  }
});

