import express from "express";
import { supabaseAdmin } from "./supabaseClient.js";
import { requireUser } from "./auth.js";

export const favoritesRouter = express.Router();

favoritesRouter.use(requireUser);

/**
 * GET /favorites
 * Returns array of recipe_id
 */
favoritesRouter.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabaseAdmin
      .from("favorites")
      .select("recipe_id")
      .eq("user_id", userId);

    if (error) throw error;

    res.json(data.map((row) => row.recipe_id));
  } catch (err) {
    console.error("Failed to fetch favorites:", err);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

/**
 * POST /favorites/:recipeId
 */
favoritesRouter.post("/:recipeId", async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipeId } = req.params;

    const { error } = await supabaseAdmin
      .from("favorites")
      .insert({
        user_id: userId,
        recipe_id: recipeId,
      });

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error("Failed to add favorite:", err);
    res.status(500).json({ error: "Failed to add favorite" });
  }
});

/**
 * DELETE /favorites/:recipeId
 */
favoritesRouter.delete("/:recipeId", async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipeId } = req.params;

    const { error } = await supabaseAdmin
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("recipe_id", recipeId);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error("Failed to remove favorite:", err);
    res.status(500).json({ error: "Failed to remove favorite" });
  }
});
