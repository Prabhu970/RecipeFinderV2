import express from "express";
import { supabaseAdmin } from "./supabaseClient.js";
import { cleanIngredient } from "./cleaningredient.js";

export const shoppingRouter = express.Router();

/**
 * POST /shopping-list
 * Add ingredient to shopping list
 * Auto-merge similar ingredients
 */
shoppingRouter.post("/", async (req, res) => {
  try {
    const { user_id, ingredient } = req.body;

    if (!user_id) return res.status(400).json({ error: "Login Required! " });
    if (!ingredient) return res.status(400).json({ error: "Missing ingredient" });

    const ingredient_clean = cleanIngredient(ingredient);

    // If ingredient already exists → increment qty
    const { data: existing } = await supabaseAdmin
      .from("shopping_list")
      .select("*")
      .eq("user_id", user_id)
      .eq("ingredient_clean", ingredient_clean)
      .maybeSingle();

    if (existing) {
      const updatedQty = existing.total_qty + 1;

      const { error } = await supabaseAdmin
        .from("shopping_list")
        .update({ total_qty: updatedQty })
        .eq("id", existing.id);

      if (error) throw error;

      return res.json({ message: "Quantity updated", total_qty: updatedQty });
    }

    // Insert new row
    const { error } = await supabaseAdmin.from("shopping_list").insert([
      {
        user_id,
        ingredient,
        ingredient_clean,
        total_qty: 1,
      },
    ]);

    if (error) throw error;

    res.json({ message: "Added to shopping list" });

  } catch (err) {
    console.error("POST /shopping-list ERROR", err);
    res.status(500).json({ error: "Server error adding item" });
  }
});

/**
 * GET /shopping-list
 */
shoppingRouter.get("/", async (req, res) => {
  try {
    const { user_id } = req.query;

    const { data, error } = await supabaseAdmin
      .from("shopping_list")
      .select("*")
      .eq("user_id", user_id);

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("GET /shopping-list ERROR", err);
    res.status(500).json({ error: "Failed to load shopping list" });
  }
});

/**
 * PATCH /shopping-list/:id
 * Update quantity
 */
shoppingRouter.patch("/:id", async (req, res) => {
  try {
    const { delta } = req.body;
    const { id } = req.params;

    const { data: row, error: findErr } = await supabaseAdmin
      .from("shopping_list")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (findErr) throw findErr;
    if (!row) return res.status(404).json({ error: "Item not found" });

    const newQty = Math.max(1, row.total_qty + delta);

    const { error } = await supabaseAdmin
      .from("shopping_list")
      .update({ total_qty: newQty })
      .eq("id", id);

    if (error) throw error;

    res.json({ total_qty: newQty });

  } catch (err) {
    console.error("PATCH /shopping-list/:id ERROR", err);
    res.status(500).json({ error: "Failed to update quantity" });
  }
});

/**
 * DELETE /shopping-list/:id
 */
shoppingRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from("shopping_list")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.json({ message: "Removed" });

  } catch (err) {
    console.error("DELETE /shopping-list/:id ERROR", err);
    res.status(500).json({ error: "Failed to delete" });
  }
});
