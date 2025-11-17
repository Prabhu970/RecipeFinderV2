import "dotenv/config";
import express from "express";
import cors from "cors";

import { recipesRouter } from "./recipes.js";
import { ratingsRouter } from "./ratings.js";
import { shoppingRouter } from "./shoppingList.js";
import { favoritesRouter } from "./favorites.js";
import { profileRouter } from "./profile.js";

const app = express();

// --------------------------------------
// FIXED CORS CONFIG FOR VERCEL + LOCALHOST
// --------------------------------------
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

// Allow ALL Vercel front-end deployments (*.vercel.app)
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if ( allowedOrigins.includes(origin) || origin.endsWith(".vercel.app") ) {
        return callback(null, true);
      }

      console.log(" Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
  })
);

// Allow preflight
app.options("*", cors());

// --------------------------------------
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/recipes", recipesRouter);
app.use("/ratings", ratingsRouter);
app.use("/shopping-list", shoppingRouter);
app.use("/favorites", favoritesRouter);
app.use("/profile", profileRouter);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Node API running on port ${PORT}`);
});
