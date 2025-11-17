import os
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai.types import Content
from .schemas import GenerateRecipeRequest, RecipeDetail
from .llm_client import generate_recipe as generate_recipe_llm

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL = os.getenv("GEMINI_MODEL", "models/gemini-2.5-flash")

@app.post("/generate-recipe", response_model=RecipeDetail)
async def generate_recipe_endpoint(payload: GenerateRecipeRequest) -> RecipeDetail:
    return generate_recipe_llm(payload)

@app.post("/ingredient-substitutions")
async def ingredient_substitutions(payload: dict):
    title = payload.get("recipeTitle", "")
    ingredients = payload.get("ingredients", [])

    system = "Provide ingredient substitutions as JSON only."
    prompt = f"""
Return only JSON:
{{
  "suggestions": ["sub1", "sub2", "sub3"]
}}

Recipe: {title}
Ingredients: {ingredients}
"""

    resp = client.models.generate_content(
        model=MODEL,
        contents=[
            Content(role="system", parts=[system]),
            Content(role="user", parts=[prompt]),
        ],
    )

    try:
        return json.loads(resp.text)
    except:
        return {"suggestions": ["Unable to parse substitutions."]}
