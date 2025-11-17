import os
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai

from .schemas import GenerateRecipeRequest, RecipeDetail
from .llm_client import generate_recipe as generate_recipe_llm

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # you can restrict this to your Vercel origin later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Use the same env var name as the README + llm_client
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.0-flash")

substitution_model = None
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    substitution_model = genai.GenerativeModel(GEMINI_MODEL)


@app.post("/generate-recipe", response_model=RecipeDetail)
async def generate_recipe_endpoint(payload: GenerateRecipeRequest) -> RecipeDetail:
    """
    Main AI recipe generator endpoint used by:
      - frontend (PYTHON_LLM_URL/generate-recipe)
      - node-api/src/pythonClient.js
    """
    return generate_recipe_llm(payload)


@app.post("/ingredient-substitutions")
async def ingredient_substitutions(payload: dict):
    """
    Suggest ingredient substitutions. Used by the frontend at:
      PYTHON_LLM_URL/ingredient-substitutions
    """
    title = payload.get("recipeTitle") or payload.get("title") or ""
    ingredients = payload.get("ingredients") or []

    # Fallback if no key configured
    if not substitution_model:
        suggestions = [
            f"If you don't have {ing}, you can usually swap it with a similar ingredient "
            f"or omit it depending on the recipe."
            for ing in ingredients
        ]
        return {"suggestions": suggestions or ["No specific substitutions available."]}

    prompt = (
        "You are an expert chef. Suggest practical ingredient substitutions for a home cook. "
        "Respond ONLY in valid JSON of the form:\n"
        '{ "suggestions": ["substitution 1", "substitution 2", "substitution 3"] }\n\n'
        f"Recipe: {title}\n"
        f"Ingredients: {', '.join(ingredients)}"
    )

    try:
        resp = substitution_model.generate_content(prompt)
        raw = (resp.text or "").strip()

        # First try: assume it's already valid JSON
        try:
            data = json.loads(raw)
            if isinstance(data, dict) and isinstance(data.get("suggestions"), list):
                return data
        except Exception:
            pass

        # Second try: extract the first JSON object substring
        try:
            import re

            match = re.search(r"\{[\s\S]*\}", raw)
            if match:
                data = json.loads(match.group(0))
                if isinstance(data, dict) and isinstance(data.get("suggestions"), list):
                    return data
        except Exception:
            pass

        # Fallback: just wrap whatever text we got
        return {"suggestions": [raw]}
    except Exception as e:
        return {"suggestions": [f"Error from AI service: {str(e)}"]}
