import express from 'express';
import { supabaseAdmin } from "./supabaseClient.js";
import { generateAIRecipe } from "./pythonClient.js";

export const recipesRouter = express.Router();

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

// ---------------------------------------------
// GET /recipes/recommended  (NO ALLERGY FILTER)
// ---------------------------------------------
recipesRouter.get('/recommended', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("recipes")
    .select(`
      id, title, description, image_url,
      cook_time_minutes, difficulty, rating, calories,
      recipe_tags ( tags ( name ) )
    `)
    .limit(40);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }

  const mapped = (data ?? []).map(mapRecipeSummary);
  res.json(mapped);
});

// ---------------------------------------------
// GET /recipes/search  (NO ALLERGY FILTER)
// ---------------------------------------------
recipesRouter.get('/search', async (req, res) => {
  const { q, diet, maxTime } = req.query;

  try {
    let query = supabaseAdmin
      .from("recipes")
      .select(`
        id, title, image_url, cook_time_minutes, difficulty, rating,
        recipe_tags ( tags ( name ) )
      `);

    if (q) query = query.ilike("title", `%${q}%`);

    const { data, error } = await query.limit(100);
    if (error) throw error;

    let mapped = (data ?? []).map(mapRecipeSummary);

    if (diet) {
      const d = diet.toLowerCase();
      mapped = mapped.filter((r) =>
        (r.tags ?? []).some((t) => t.toLowerCase() === d)
      );
    }

    if (maxTime) {
      const max = Number(maxTime);
      mapped = mapped.filter(
        (r) => !r.cookTimeMinutes || r.cookTimeMinutes <= max
      );
    }

    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to search recipes" });
  }
});

// ---------------------------------------------
// GET /recipes/:id
// ---------------------------------------------
recipesRouter.get('/:id', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from("recipes")
    .select(`
      id, title, image_url, cook_time_minutes, difficulty, rating, calories,
      ingredients ( name, quantity ),
      steps ( step_number, instruction ),
      recipe_tags ( tags ( name ) )
    `)
    .eq("id", id)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).send("Recipe not found");

  res.json(mapRecipeDetail(data));
});

// ---------------------------------------------
// POST /recipes/generate-ai
// ---------------------------------------------
recipesRouter.post('/generate-ai', async (req, res) => {
  try {
    const recipe = await generateAIRecipe(req.body);
    res.json(recipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate AI recipe" });
  }
});
