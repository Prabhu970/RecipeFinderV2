import "dotenv/config";
import express from "express";
import cors from "cors";

import { recipesRouter } from "./recipes.js";
import { ratingsRouter } from "./ratings.js";
import { shoppingRouter } from "./shoppingList.js";
import { favoritesRouter } from "./favorites.js";
import { profileRouter } from "./profile.js";

const app = express();

// ------------------------------
// CORS FIX FOR RENDER + VERCEL
// ------------------------------
const allowedOrigins = [
  "*",
  "https://recipe-finder-v2-b8be-qp0kej4bd.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "*"
];

// MAIN CORS MIDDLEWARE
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server or no-origin requests
      if (!origin) return callback(null, true);

      // Allow Vercel preview deployments: *.vercel.app
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      // Allow whitelisted origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("❌ BLOCKED BY CORS:", origin);
      return callback(new Error("Not allowed by CORS"), false);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Manual override — REQUIRED BY RENDER
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (
    origin &&
    (origin.endsWith(".vercel.app") || allowedOrigins.includes(origin))
  ) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, user-id"
  );
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");

  next();
});

// --------------------------------------
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use("/recipes", recipesRouter);
app.use("/ratings", ratingsRouter);
app.use("/shopping-list", shoppingRouter);
app.use("/favorites", favoritesRouter);
app.use("/profile", profileRouter);

// --------------------------------------
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Node API running on port ${PORT}`);
});
