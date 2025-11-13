import os
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from google import genai

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",  # for now allow all; tighten later
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

@app.get("/")
def root():
    return {"status": "python-llm is running"}

@app.post("/ingredient-substitutions")
async def ingredient_substitutions(payload: dict):
    ingredient = payload.get("ingredient")
    if not ingredient:
        return {"error": "ingredient is required"}

    prompt = (
        "For the following ingredient, suggest practical substitutions "
        "for a home cook. Respond ONLY in valid JSON of the form: "
        "{\"suggestions\": [\"...\"]}. "
        f"Ingredient: {ingredient}"
    )

    try:
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt
        )

        raw = response.text.strip()

        # Try parsing JSON
        try:
            data = json.loads(raw)
        except:
            data = {"suggestions": [raw]}

        return data

    except Exception as e:
        return {"error": str(e)}
