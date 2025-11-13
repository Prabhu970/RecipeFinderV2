import os
import google.generativeai as genai
from .schemas import GenerateRecipeRequest, RecipeDetail
import uuid

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

api_key = os.getenv("AIzaSyAoZEa4tELS7mZqYSI4K16Knnxvg_yVl8s")
if api_key:
  genai.configure(api_key=api_key)
  model = genai.GenerativeModel(GEMINI_MODEL)
else:
  model = None

def _fallback_recipe(prompt: str, req: GenerateRecipeRequest) -> RecipeDetail:
  ingredients = req.ingredients
  steps = [
    "Read through the ingredients and preheat your oven or pan if needed.",
    "Prepare all ingredients by washing, chopping and measuring.",
    "Cook the ingredients using appropriate methods (sauté, boil, bake) until done.",
    "Taste and adjust seasoning with salt, pepper and herbs.",
    "Serve warm and enjoy your AI-generated meal!"
  ]
  return RecipeDetail(
    id=str(uuid.uuid4()),
    title=req.title or "AI generated recipe",
    ingredients=ingredients,
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
  prompt = (
    "You are an expert chef. Generate a structured recipe as JSON with fields: "
    "title, ingredients (list), steps (list), servings (int), cook_time_minutes (int), "
    "difficulty (easy|medium|hard), rating (float 1-5), tags (list of strings). "
    f"Ingredients: {req.ingredients}. "
    f"Optional title: {req.title}. "
    f"Dietary tags: {req.dietary_tags}. "
    f"Servings: {req.servings}."
  )

  if not model:
    return _fallback_recipe(prompt, req)

  try:
    response = model.generate_content(prompt)
    text = response.text or ""
    # Very lightweight parsing: expect the model to output JSON-like content; if it fails, fallback.
    import json
    import re

    match = re.search(r"\{[\s\S]*\}", text)
    if not match:
      return _fallback_recipe(prompt, req)

    data = json.loads(match.group(0))

    return RecipeDetail(
      id=str(uuid.uuid4()),
      title=data.get("title") or req.title or "AI generated recipe",
      ingredients=data.get("ingredients") or req.ingredients,
      steps=data.get("steps") or _fallback_recipe(prompt, req).steps,
      servings=data.get("servings") or req.servings or 2,
      calories=data.get("calories"),
      cook_time_minutes=data.get("cook_time_minutes"),
      difficulty=data.get("difficulty") or "easy",
      rating=data.get("rating") or 4.5,
      tags=data.get("tags") or req.dietary_tags or [],
      image_url=data.get("image_url"),
    )
  except Exception:
    return _fallback_recipe(prompt, req)
