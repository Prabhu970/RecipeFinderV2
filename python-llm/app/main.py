import os
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai.types import Content
from .schemas import GenerateRecipeRequest, RecipeDetail

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
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL = os.getenv("GEMINI_MODEL", "models/gemini-2.5-flash")

def extract_json(text: str):
    """Safely extract JSON object from LLM output."""
    try:
        return json.loads(text)
    except:
        pass

    import re
    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        return json.loads(match.group(0))

    raise ValueError("LLM returned invalid JSON")


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
    title = payload.get("recipeTitle", "")
    ingredients = payload.get("ingredients", [])

    system_msg = (
        "You are a culinary expert. Always reply using STRICT JSON only. "
        "No natural language. No explanations. No markdown."
    )

    user_msg = f"""
Return JSON ONLY:

{{
  "suggestions": ["sub1", "sub2", "sub3"]
}}

Recipe: {title}
Ingredients: {", ".join(ingredients)}
"""

    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=[
                # Gemini 2.5 uses role="user" for BOTH system & user context
                Content(role="user", parts=[{"text": system_msg}]),
                Content(role="user", parts=[{"text": user_msg}]),
            ],
        )

        raw = response.text
        print("RAW LLM OUTPUT:", raw)

        return extract_json(raw)

    except Exception as e:
        return {
            "suggestions": [f"Error from AI service: {str(e)}"]
        }
