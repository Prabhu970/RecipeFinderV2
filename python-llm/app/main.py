from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .schemas import GenerateRecipeRequest, RecipeDetail
from .llm_client import generate_recipe

app = FastAPI(title="Recipe LLM Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/generate-recipe", response_model=RecipeDetail)
def generate_recipe_endpoint(req: GenerateRecipeRequest):
    return generate_recipe(req)

from .llm_client import model
import json
import re


@app.post("/ingredient-substitutions")
def ingredient_substitutions(payload: dict):
    """Return AI-suggested ingredient substitutions.

    Expects: { "recipeTitle": str, "ingredients": List[str] }
    Returns: { "suggestions": List[str] }
    """
    title = payload.get("recipeTitle", "this recipe")
    ingredients = payload.get("ingredients", [])

    if model is None:
        return {
            "suggestions": [
                "AI is not configured. Check GEMINI_API_KEY on the LLM service.",
            ]
        }

    prompt = (
        "For the following recipe and its ingredients, suggest practical "+
        "ingredient substitutions for a home cook. "+
        "Return ONLY JSON of the form: "+
        "{\"suggestions\": [\"...\", "..."]}."+
        f"Recipe: {title}\n"+
        f"Ingredients: {ingredients}\n"+
    )

    resp = model.generate_content(prompt)
    text = resp.text or ""

    # Try to extract JSON object from response
    match = re.search(r"{[\s\S]*}", text)
    if not match:
        return {
            "suggestions": [
                "AI could not determine substitutions right now. Try again."
            ]
        }

    try:
        data = json.loads(match.group(0))
        suggestions = data.get("suggestions") or []
        if not isinstance(suggestions, list):
            raise ValueError("Invalid suggestions field")
        return {"suggestions": suggestions}
    except Exception:
        return {
            "suggestions": [
                "AI could not parse substitutions. Try again."
            ]
        }
