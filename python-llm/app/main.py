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
    allow_origins=[
        "https://recipe-finder-v2-b8be-cpb2w4ejg.vercel.app",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    return generate_recipe_llm(payload)


@app.post("/ingredient-substitutions")
async def ingredient_substitutions(payload: dict):
    title = payload.get("recipeTitle", "")
    ingredients = payload.get("ingredients", [])

    system = (
        "You are a culinary expert. Provide useful ingredient substitutions in strict JSON."
    )

    prompt = f"""
Return only JSON:

{{ "suggestions": ["sub1", "sub2", "sub3"] }}

Recipe: {title}
Ingredients: {", ".join(ingredients)}
"""

    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=[
                Content(role="system", parts=[{"text": system}]),
                Content(role="user", parts=[{"text": prompt}]),
            ]
        )

        raw = response.text
        data = extract_json(raw)
        return data

    except Exception as e:
        return {"suggestions": [f"Error from AI service: {str(e)}"]}
