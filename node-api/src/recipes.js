import express from 'express';
import { supabaseAdmin } from './supabaseClient.js';
import { generateAIRecipe } from './pythonClient.js';
import fetch from "node-fetch";

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
function containsAllergen(ingredients, allergies) {
  if (!allergies || allergies.length === 0) return false;
  const text = ingredients.join(" ").toLowerCase();

  return allergies.some(a => text.includes(a.toLowerCase()));
}



async function isRecipeUnsafe(allergies, ingredients) {
  const res = await fetch(`${process.env.PYTHON_LLM_URL}/check-allergy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ allergies, ingredients })
  });

  return await res.json(); // { unsafe: true/false, reason: "" }
}


// ---- GET /recipes/recommended ----
recipesRouter.get('/recommended', async (req, res) => {
  const userId = req.headers["user-id"];

  // 1) Get all recipes
  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("*");

  if (error) return res.status(500).json({ error: error.message });

  // 2) Fetch user allergies
  const { data: profile } = await supabase
    .from("profiles")
    .select("allergies")
    .eq("id", userId)
    .single();

  const allergies = profile?.allergies || "";

  // 3) Ask Python LLM to separate safe/unsafe
  const py = await fetch(`${process.env.PYTHON_LLM_URL}/filter-recipes-by-allergy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ allergies, recipes }),
  });

  const filtered = await py.json();
  return res.json(filtered);
});

// ---- GET /recipes/search ----
recipesRouter.get('/search', async (req, res) => {
  const { q, diet, maxTime } = req.query;

  try {
    let query = supabaseAdmin
      .from('recipes')
      .select(`
        id,
        title,
        description,
        image_url,
        cook_time_minutes,
        difficulty,
        rating,
        calories,
        recipe_tags (
          tags ( name )
        )
      `);

    if (q) {
      query = query.ilike('title', `%${q}%`);
    }

    const { data, error } = await query.limit(100);
    if (error) throw error;

    let mapped = (data ?? []).map(mapRecipeSummary);

    if (diet) {
      const dietLower = diet.toLowerCase();
      mapped = mapped.filter((r) =>
        (r.tags ?? []).some((t) => t.toLowerCase() === dietLower)
      );
    }

    if (maxTime) {
      const max = Number(maxTime);
      mapped = mapped.filter(
        (r) => !r.cookTimeMinutes || r.cookTimeMinutes <= max
      );
    }
    const safe = [];
    const unsafe = [];

    for (const r of mapped) {
      const check = await isRecipeUnsafe(allergies, r.ingredients);
      if (check.unsafe) unsafe.push({ ...r, unsafeReason: check.reason });
      else safe.push(r);
    }

    res.json({ safe, unsafe });
  } catch (err) {
    console.error('Error in /recipes/search', err);
    res.status(500).send('Failed to search recipes');
  }
});

// ---- GET /recipes/:id ----
recipesRouter.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabaseAdmin
      .from('recipes')
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
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).send('Recipe not found');

    res.json(mapRecipeDetail(data));
  } catch (err) {
    console.error('Error in /recipes/:id', err);
    res.status(500).send('Failed to load recipe');
  }
});

// ---- POST /recipes/generate-ai ----
recipesRouter.post('/generate-ai', async (req, res) => {
  try {
    const generated = await generateAIRecipe(req.body);
    res.json(generated);
  } catch (err) {
    console.error('Error in /recipes/generate-ai', err);
    res.status(500).send('Failed to generate recipe');
  }
});
