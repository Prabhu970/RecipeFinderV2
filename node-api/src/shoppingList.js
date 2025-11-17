import express from "express";
import { supabaseAdmin } from "./supabaseClient.js";
import { cleanIngredient } from "./cleaningredient.js";

export const shoppingRouter = express.Router();

// ADD INGREDIENT — WITH MERGING
shoppingRouter.post("/add", async (req, res) => {
  try {
    const { user_id, ingredient, quantity } = req.body;

    if (!user_id || !ingredient)
      return res.status(400).json({ error: "Missing user_id or ingredient" });

    const cleanedName = cleanIngredient(ingredient);

    // check if this ingredient already exists for this user
    const { data: existing } = await supabaseAdmin
      .from("shopping_list")
      .select("*")
      .eq("user_id", user_id)
      .eq("ingredient_clean", cleanedName)
      .maybeSingle();

    // If already exists → increment quantity
    if (existing) {
      const newQty = (existing.total_qty ?? 1) + (quantity ?? 1);

      await supabaseAdmin
        .from("shopping_list")
        .update({ total_qty: newQty })
        .eq("id", existing.id);

      return res.json({ merged: true, id: existing.id, qty: newQty });
    }

    // Insert new ingredient
    const { data, error } = await supabaseAdmin
      .from("shopping_list")
      .insert([
        {
          user_id,
          ingredient: ingredient,
          ingredient_clean: cleanedName,
          total_qty: quantity ?? 1,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("Error adding:", err);
    res.status(500).json({ error: "Could not add ingredient" });
  }
});

// GET SHOPPING LIST (clean names only)
shoppingRouter.get("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const { data, error } = await supabaseAdmin
      .from("shopping_list")
      .select("id, ingredient_clean, total_qty")
      .eq("user_id", user_id)
      .order("ingredient_clean", { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("Error fetching shopping list:", err);
    res.status(500).json({ error: "Could not fetch shopping list" });
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
