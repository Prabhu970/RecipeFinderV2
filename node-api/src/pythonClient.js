import 'dotenv/config';
import fetch from 'node-fetch';

const baseUrl = process.env.PYTHON_LLM_URL ?? 'http://localhost:8000';

export async function generateAIRecipe(payload) {
  const res = await fetch(`${baseUrl}/generate-recipe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }

  return res.json();
}