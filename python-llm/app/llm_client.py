import os
import json
from google import genai
from google.genai.types import Content
from .schemas import GenerateRecipeRequest, RecipeDetail

# Initialize Gemini client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL = os.getenv("GEMINI_MODEL", "models/gemini-2.5-flash")


def extract_json(text: str):
    """
    Safely extract JSON from Gemini output.
    """
    try:
        return json.loads(text)
    except:
        pass

    import re
    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        return json.loads(match.group(0))

    raise ValueError("LLM returned invalid JSON")


# =====================================================
#   MAIN AI RECIPE GENERATOR (used by /generate-recipe)
# =====================================================

def generate_recipe(payload: GenerateRecipeRequest) -> RecipeDetail:
    """
    Calls Gemini 2.5 Flash to generate a structured recipe.
    Ensures output is always valid JSON in RecipeDetail format.
    """

    system_instruction = """
You are an AI recipe generator. Return ONLY strict JSON following this schema:

{
  "id": "string",
  "title": "string",
  "imageUrl": "string",
  "ingredients": ["ing1", "ing2", "..."],
  "steps": ["step1", "step2", "..."],
  "servings": number,
  "calories": number,
  "cookTimeMinutes": number,
  "difficulty": "easy" | "medium" | "hard",
  "tags": ["tag1", "tag2"]
}

NO extra commentary. NO markdown. Only JSON.
"""

    user_prompt = {
        "title": payload.title or "AI generated recipe",
        "ingredients": payload.ingredients,
        "servings": payload.servings,
        "dietaryTags": payload.dietaryTags or [],
    }

    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=[
                Content(role="system", parts=[system_instruction]),
                Content(role="user", parts=[json.dumps(user_prompt)]),
            ],
        )

        raw = response.text.strip()
        data = extract_json(raw)

        # Ensure output matches RecipeDetail
        return RecipeDetail(**data)

    except Exception as e:
        # Fail-open fallback recipe
        return RecipeDetail(
            id="llm-fallback",
            title="AI Recipe Error",
            imageUrl="",
            ingredients=payload.ingredients,
            steps=[
                "An error occurred while generating the recipe.",
                f"Error: {str(e)}",
            ],
            servings=payload.servings or 1,
            calories=0,
            cookTimeMinutes=0,
            difficulty="easy",
            tags=["error"],
        )
