
import express from "express";
import { supabaseAdmin } from "./supabaseClient.js";
import { cleanIngredient } from "./cleaningredient.js";

export const shoppingRouter = express.Router();

// --------------------------
// POST /shopping-list (Bulk)
// --------------------------
shoppingRouter.post("/", async (req, res) => {
  try {
    const { user_id, items } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: "Missing user_id" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Missing items array" });
    }

    const inserts = [];

    for (const raw of items) {
      const ingredient_clean = cleanIngredient(raw);

      // Check if user already has this ingredient
      const { data: existing } = await supabaseAdmin
        .from("shopping_list")
        .select("*")
        .eq("user_id", user_id)
        .eq("ingredient_clean", ingredient_clean)
        .maybeSingle();

      if (existing) {
        // update qty
        const newQty = existing.total_qty + 1;

        await supabaseAdmin
          .from("shopping_list")
          .update({ total_qty: newQty })
          .eq("id", existing.id);
      } else {
        inserts.push({
          user_id,
          ingredient: raw,
          ingredient_clean,
          total_qty: 1,
        });
      }
    }

    if (inserts.length > 0) {
      await supabaseAdmin.from("shopping_list").insert(inserts);
    }

    res.json({ success: true, added: inserts.length });
  } catch (err) {
    console.error("Error POST /shopping-list", err);
    res.status(500).json({ error: "Failed to add shopping items" });
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
