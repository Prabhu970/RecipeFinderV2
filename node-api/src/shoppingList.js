import express from "express";
import { supabaseAdmin } from "./supabaseClient.js";
import { cleanIngredient } from "./utils/cleanIngredient.js";

export const shoppingRouter = express.Router();

// --------------------------------------------------
// GET /shopping-list  (load shopping list)
// --------------------------------------------------
shoppingRouter.get("/", async (req, res) => {
  const userId = req.headers["x-user-id"];

  if (!userId) return res.status(400).json({ error: "Missing user id" });

  const { data, error } = await supabaseAdmin
    .from("shopping_list")
    .select("*")
    .eq("user_id", userId)
    .order("ingredient_clean");

  if (error) return res.status(500).json(error);

  res.json(data);
});

// --------------------------------------------------
// POST /shopping-list  (ADD ITEM)
// --------------------------------------------------
shoppingRouter.post("/", async (req, res) => {
  const userId = req.headers["x-user-id"];
  const { ingredient } = req.body;

  if (!userId) return res.status(400).json({ error: "Missing user id" });
  if (!ingredient) return res.status(400).json({ error: "Missing ingredient" });

  const ingredient_clean = cleanIngredient(ingredient);

  // Does this ingredient already exist?
  const { data: existing } = await supabaseAdmin
    .from("shopping_list")
    .select("*")
    .eq("user_id", userId)
    .eq("ingredient_clean", ingredient_clean)
    .maybeSingle();

  if (existing) {
    // Update +1 quantity
    const { data, error } = await supabaseAdmin
      .from("shopping_list")
      .update({ total_qty: existing.total_qty + 1 })
      .eq("id", existing.id)
      .select()
      .maybeSingle();

    if (error) return res.status(500).json(error);
    return res.json(data);
  }

  // Insert new item
  const { data, error } = await supabaseAdmin
    .from("shopping_list")
    .insert({
      user_id: userId,
      ingredient,
      ingredient_clean,
      total_qty: 1,
      checked: false,
    })
    .select()
    .maybeSingle();

  if (error) return res.status(500).json(error);
  res.json(data);
});

// --------------------------------------------------
// PATCH /shopping-list/update-qty
// --------------------------------------------------
shoppingRouter.patch("/update-qty", async (req, res) => {
  const { id, newQty } = req.body;

  const { data, error } = await supabaseAdmin
    .from("shopping_list")
    .update({ total_qty: newQty })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) return res.status(500).json(error);
  res.json(data);
});

// --------------------------------------------------
// DELETE /shopping-list/:id
// --------------------------------------------------
shoppingRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from("shopping_list")
    .delete()
    .eq("id", id);

  if (error) return res.status(500).json(error);
  res.json({ success: true });
});
