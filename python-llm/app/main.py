import os
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai.types import Content
from .schemas import (
    GenerateRecipeRequest,
    RecipeDetail,
    AllergyFilterRequest,
    AllergyFilterResponse,
)
from .llm_client import generate_recipe as generate_recipe_llm

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini Client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL = os.getenv("GEMINI_MODEL", "models/gemini-2.5-flash")

def extract_json(text: str):
    """Safely extract JSON from model output."""
    try:
        return json.loads(text)
    except:
        pass

    import re
    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        return json.loads(match.group(0))

    raise ValueError("LLM returned invalid JSON")

# ======================================================
# AI Recipe Generation
# ======================================================
@app.post("/generate-recipe", response_model=RecipeDetail)
async def generate_recipe_endpoint(payload: GenerateRecipeRequest) -> RecipeDetail:
    return generate_recipe_llm(payload)


# ======================================================
# Ingredient Substitution Endpoint
# ======================================================
@app.post("/ingredient-substitutions")
async def ingredient_substitutions(payload: dict):
    title = payload.get("recipeTitle", "")
    ingredients = payload.get("ingredients", [])

    system = "You are a culinary expert. Provide ingredient substitutions in strict JSON."
    prompt = f"""
Return only JSON:

{{
  "suggestions": ["sub1", "sub2", "sub3"]
}}

Recipe: {title}
Ingredients: {", ".join(ingredients)}
"""

    try:
        resp = client.models.generate_content(
            model=MODEL,
            contents=[
                Content(role="system", parts=[system]),
                Content(role="user", parts=[prompt]),
            ],
        )

        raw = resp.text
        return extract_json(raw)

    except Exception as e:
        return {"suggestions": [f"Error from AI service: {str(e)}"]}


# ======================================================
# Allergy-Based Filtering (Gemini 2.5 Flash)
# ======================================================
@app.post("/filter-recipes-by-allergy", response_model=AllergyFilterResponse)
async def filter_recipes_by_allergy(payload: AllergyFilterRequest) -> AllergyFilterResponse:
    """Return safe and unsafe recipes based on user allergies."""
    
    if not MODEL:
        return AllergyFilterResponse(safe=payload.recipes, unsafe=[])

    prompt = f"""
You are an allergen-aware food safety expert.

User allergies (free text):
{payload.allergies}

Your task:
For each recipe, check ingredients + tags to see if they contain ANY allergen conflict.

Return ONLY JSON:
{{
  "safe_ids": ["id1", "id2"],
  "unsafe_ids": ["id3", "id4"]
}}

Recipes:
{json.dumps([r.dict() for r in payload.recipes], ensure_ascii=False)}
"""

    try:
        resp = client.models.generate_content(
            model=MODEL,
            contents=[Content(role="user", parts=[prompt])],
        )

        raw = (resp.text or "").strip()

        # Try parsing normally
        try:
            parsed = json.loads(raw)
        except:
            # Fallback: extract JSON substring
            import re
            m = re.search(r"\{[\s\S]*\}", raw)
            parsed = json.loads(m.group(0)) if m else None

        if not parsed or not isinstance(parsed, dict):
            return AllergyFilterResponse(safe=payload.recipes, unsafe=[])

        safe_ids = set(parsed.get("safe_ids", []))
        unsafe_ids = set(parsed.get("unsafe_ids", []))
        all_ids = {r.id for r in payload.recipes}

        # Infer missing lists
        if not unsafe_ids:
            unsafe_ids = all_ids - safe_ids
        if not safe_ids:
            safe_ids = all_ids - unsafe_ids

        safe = [r for r in payload.recipes if r.id in safe_ids]
        unsafe = [r for r in payload.recipes if r.id in unsafe_ids]

        return AllergyFilterResponse(safe=safe, unsafe=unsafe)

    except Exception:
        # fail-open: no hiding if LLM fails
        return AllergyFilterResponse(safe=payload.recipes, unsafe=[])
