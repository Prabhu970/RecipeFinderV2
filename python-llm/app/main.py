import os
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or restrict to your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")


@app.post("/ingredient-substitutions")
async def ingredient_substitutions(payload: dict):
  title = payload.get("title", "")
  ingredients = payload.get("ingredients", [])

  prompt = (
      "You are an expert chef. Suggest practical ingredient substitutions for a home cook. "
      "Respond ONLY in valid JSON of the form:\n"
      "{ \"suggestions\": [\"substitution 1\", \"substitution 2\", \"substitution 3\"] }\n\n"
      f"Recipe: {title}\n"
      f"Ingredients: {', '.join(ingredients)}"
  )

  try:
      resp = model.generate_content(prompt)
      raw = resp.text.strip()

      try:
          data = json.loads(raw)
          if "suggestions" in data and isinstance(data["suggestions"], list):
              return data
      except Exception:
          pass

      # Fallback
      return {"suggestions": [raw]}
  except Exception as e:
      return {"suggestions": [f"Error from AI service: {str(e)}"]}
