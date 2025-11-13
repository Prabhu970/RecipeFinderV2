import 'dotenv/config';
import express from 'express';
import cors from 'cors';

// FIX HERE ⬇⬇⬇
import { recipesRouter } from './routes/recipes.js';
// NOT: './recipes.js'

import { ratingsRouter } from './ratings.js';
import { shoppingRouter } from './shoppingList.js';
import { favoritesRouter } from './favorites.js';
import { profileRouter } from './profile.js';

const app = express();

app.use(cors({
    origin: [
        "https://recipe-finder-v2-b8be-apdzmsn8e.vercel.app",
        "http://localhost:5173"
    ],
    credentials: true,
}));

app.options("*", cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/recipes', recipesRouter);
app.use('/ratings', ratingsRouter);
app.use('/shopping-list', shoppingRouter);
app.use('/favorites', favoritesRouter);
app.use('/profile', profileRouter);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Node API running on port ${PORT}`);
});
