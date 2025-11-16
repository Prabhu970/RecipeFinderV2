import express from "express";
import { supabaseAdmin } from "./supabaseClient.js";
import { requireUser } from "./auth.js";

export const shoppingRouter = express.Router();

shoppingRouter.use(requireUser);

/**
 * GET /shopping-list
 */
shoppingRouter.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabaseAdmin
      .from("shopping_list")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("Failed to fetch shopping list:", err);
    res.status(500).json({ error: "Shopping list fetch failed" });
  }
});

/**
 * POST /shopping-list
 * Body: { recipeId, items[] }
 */
shoppingRouter.post("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipeId, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "items[] is required" });
    }

    const rows = items.map((item) => ({
      ingredient:item,
      quantity: item.quantity || null,
      checked: false,
      user_id: userId,
    }));

    const { data, error } = await supabaseAdmin
      .from("shopping_list")
      .insert(rows)
      .select();

    if (error) throw error;

    res.json({ success: true, added: data });
  } catch (err) {
    console.error("Failed to add shopping items:", err);
    res.status(500).json({ error: "Could not add items" });
  }
});

/**
 * DELETE /shopping-list/:id
 */
shoppingRouter.delete("/:id", async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from("shopping_list")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error("Failed to delete shopping item:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});
