import express from "express";
import { supabaseAdmin } from "./supabaseClient.js";
import { requireUser } from "./auth.js";

export const ratingsRouter = express.Router();

ratingsRouter.use(requireUser);

/**
 * POST /ratings
 * Body: { recipeId, rating, review }
 */
ratingsRouter.post("/", async (req, res) => {
  try {
    const { recipeId, rating, review } = req.body;
    const userId = req.user.id;

    if (!recipeId || !rating) {
      return res.status(400).json({ error: "recipeId and rating are required" });
    }

    const { data, error } = await supabaseAdmin
      .from("ratings")
      .insert({
        recipe_id: recipeId,
        rating,
        review,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, rating: data });
  } catch (err) {
    console.error("Error saving rating:", err);
    res.status(500).json({ error: "Failed to save rating" });
  }
});

/**
 * GET /ratings/:recipeId
 */
ratingsRouter.get("/:recipeId", async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { data, error } = await supabaseAdmin
      .from("ratings")
      .select("*")
      .eq("recipe_id", recipeId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("Error fetching ratings:", err);
    res.status(500).json({ error: "Failed to fetch ratings" });
  }
});
