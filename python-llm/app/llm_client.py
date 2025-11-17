import os
import json
from google import genai
from google.genai.types import Content
from .schemas import GenerateRecipeRequest, RecipeDetail

# Configure Gemini
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


def generate_recipe(payload: GenerateRecipeRequest) -> RecipeDetail:
    """Generate a recipe using Gemini 2.5 Flash with new SDK."""

    ingredients = ", ".join(payload.ingredients)
    dietary_tags = ", ".join(payload.dietary_tags or [])

    system = (
        "You are a world-class chef. Always respond ONLY in JSON using the exact schema."
    )

    user_prompt = f"""
Generate a complete recipe using **ONLY** this JSON structure:

{{
  "title": "string",
  "description": "string",
  "servings": number,
  "ingredients": ["item 1", "item 2"],
  "steps": ["step 1", "step 2"],
  "cookTimeMinutes": number,
  "difficulty": "easy | medium | hard",
  "tags": ["tag1", "tag2"]
}}

INPUT DATA:
- Preferred title: "{payload.title or ''}"
- Ingredients: {ingredients}
- Servings: {payload.servings}
- Dietary tags: {dietary_tags}

RULES:
- STRICT JSON ONLY (no markdown)
- Must include 6–12 ingredients
- Must include 4–10 steps
- Difficulty should match realism
"""

    response = client.models.generate_content(
            model=MODEL,
            contents=[
                Content(role="system", parts=[{"text": system}]),
                Content(role="user", parts=[{"text": user_prompt}]),
            ]
        )

       

    raw_text = response.text  # correct new API

    data = extract_json(raw_text)

    return RecipeDetail(
        title=data["title"],
        description=data["description"],
        servings=data["servings"],
        ingredients=data["ingredients"],
        steps=data["steps"],
        cookTimeMinutes=data["cookTimeMinutes"],
        difficulty=data["difficulty"],
        tags=data["tags"]
    )