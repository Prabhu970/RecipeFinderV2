import express from 'express';
import { supabaseAdmin } from './supabaseClient.js';
import { generateAIRecipe } from './pythonClient.js';

export const recipesRouter = express.Router();

// GET /recipes/recommended
recipesRouter.get('/recommended', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('recipes')
      .select('id,title,image_url,cook_time_minutes,difficulty,rating,tags')
      .limit(24);

    if (error) throw error;

    const mapped = (data ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      imageUrl: r.image_url,
      cookTimeMinutes: r.cook_time_minutes,
      difficulty: r.difficulty,
      rating: r.rating,
      tags: r.tags
    }));

    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to load recipes');
  }
});

// GET /recipes/search?q=&diet=&maxTime=
recipesRouter.get('/search', async (req, res) => {
  const { q, diet, maxTime } = req.query;

  try {
    let query = supabaseAdmin
      .from('recipes')
      .select('id,title,image_url,cook_time_minutes,difficulty,rating,tags');

    if (q) {
      query = query.ilike('title', `%${q}%`);
    }
    if (diet) {
      query = query.contains('tags', [diet]);
    }
    if (maxTime) {
      query = query.lte('cook_time_minutes', Number(maxTime));
    }

    const { data, error } = await query.limit(48);

    if (error) throw error;

    const mapped = (data ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      imageUrl: r.image_url,
      cookTimeMinutes: r.cook_time_minutes,
      difficulty: r.difficulty,
      rating: r.rating,
      tags: r.tags
    }));

    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to search recipes');
  }
});

// GET /recipes/:id
recipesRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabaseAdmin
      .from('recipes')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).send('Recipe not found');

    const mapped = {
      id: data.id,
      title: data.title,
      imageUrl: data.image_url,
      cookTimeMinutes: data.cook_time_minutes,
      difficulty: data.difficulty,
      rating: data.rating,
      tags: data.tags,
      ingredients: data.ingredients ?? [],
      steps: data.steps ?? [],
      servings: data.servings,
      calories: data.calories
    };

    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to load recipe');
  }
});

// POST /recipes/generate-ai
recipesRouter.post('/generate-ai', async (req, res) => {
  try {
    const generated = await generateAIRecipe(req.body);
    res.json(generated);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to generate recipe');
  }
});
