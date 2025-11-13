import os
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai

app = FastAPI()

# 🚀 Enable CORS (must be above routes)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # allow all for now; restrict later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🚀 Initialize Gemini API
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

model = genai.GenerativeModel("gemini-1.5-flash")

@app.get("/")
def root():
    return {"status": "python-llm running"}

@app.post("/ingredient-substitutions")
async def ingredient_substitutions(payload: dict):
    ingredient = payload.get("ingredient", "").strip()
    if not ingredient:
        return {"error": "ingredient is required"}

    prompt = f"""
        "For the following ingredient, suggest practical substitutions for a home cook. "
        "Respond ONLY in valid JSON of the form: "
        {{
        "suggestions": [
            "substitute text 1",
            "substitute text 2"
        ]
        }}

        Ingredients: {", ".join(ingredient)}
    """

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()

        try:
            data = json.loads(text)
            if "suggestions" in data:
                return data
        except Exception:
            pass

        # Fallback if Gemini returns plain text
        return {
            "suggestions": [
                f"No direct AI suggestions found.",
                f"Raw output: {text}"
            ]
        }

    except Exception as e:
        return {"error": str(e)}
