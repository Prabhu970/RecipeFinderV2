import os
import uuid
from .schemas import GenerateRecipeRequest, RecipeDetail
import google.generativeai as genai

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.0-flash")
api_key = os.getenv("GEMINI_API_KEY")

if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(GEMINI_MODEL)
else:
    model = None


def _fallback_recipe(req: GenerateRecipeRequest) -> RecipeDetail:
    steps = [
        "Read through all ingredients and preheat any oven or pan if needed.",
        "Wash, chop and measure all ingredients.",
        "Cook ingredients in a sensible order until done.",
        "Taste and adjust seasoning with salt, pepper and herbs.",
        "Plate, garnish and serve."
    ]
    return RecipeDetail(
        id=str(uuid.uuid4()),
        title=req.title or "AI generated recipe",
        ingredients=req.ingredients,
        steps=steps,
        servings=req.servings or 2,
        calories=None,
        cook_time_minutes=30,
        difficulty="easy",
        rating=4.5,
        tags=req.dietary_tags or [],
        image_url=None,
    )


def generate_recipe(req: GenerateRecipeRequest) -> RecipeDetail:
    if not model:
        return _fallback_recipe(req)

    prompt = (
        "You are an expert home cook. Generate one detailed recipe as JSON with keys: "
        "title, ingredients (list of strings), steps (list of strings), servings (int), "
        "cook_time_minutes (int), difficulty ('easy'|'medium'|'hard'), rating (float 1-5), "
        "tags (list of short strings), optional image_url (string). "
        f"Use these ingredients as the base: {req.ingredients}. "
    )
    if req.title:
        prompt += f"Match this vibe: {req.title}. "
    if req.dietary_tags:
        prompt += f"Respect these dietary tags: {req.dietary_tags}. "
    if req.servings:
        prompt += f"Target servings: {req.servings}. "

    try:
        response = model.generate_content(prompt)
        text = response.text or ""
        import json
        import re

        match = re.search(r"\{[\s\S]*\}", text)
        if not match:
            return _fallback_recipe(req)
        data = json.loads(match.group(0))
        return RecipeDetail(
            id=str(uuid.uuid4()),
            title=data.get("title") or req.title or "AI generated recipe",
            ingredients=data.get("ingredients") or req.ingredients,
            steps=data.get("steps") or _fallback_recipe(req).steps,
            servings=data.get("servings") or req.servings or 2,
            calories=data.get("calories"),
            cook_time_minutes=data.get("cook_time_minutes"),
            difficulty=data.get("difficulty") or "easy",
            rating=data.get("rating") or 4.5,
            tags=data.get("tags") or req.dietary_tags or [],
            image_url=data.get("image_url"),
        )
    except Exception:
        return _fallback_recipe(req)
