import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { recipesRouter } from './recipes.js';

const app = express();
const port = process.env.PORT || 4000;

app.use(
  cors({
    origin: '*'
  })
);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/recipes', recipesRouter);

app.listen(port, () => {
  console.log(`Node API listening on http://localhost:${port}`);
});
