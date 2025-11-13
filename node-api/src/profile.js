import express from "express";
import { supabaseAdmin } from "./supabaseClient.js";
import { requireUser } from "./auth.js";

export const profileRouter = express.Router();

profileRouter.use(requireUser);

/**
 * GET /profile
 */
profileRouter.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabaseAdmin
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("Failed to fetch profile:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

/**
 * POST /profile
 * Body: partial profile fields
 */
profileRouter.post("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const payload = req.body || {};

    const { data, error } = await supabaseAdmin
      .from("user_profiles")
      .upsert({
        id: userId,
        ...payload,
      })
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("Failed to update profile:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});
