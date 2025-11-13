from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .schemas import GenerateRecipeRequest, RecipeDetail
from .llm_client import generate_recipe

app = FastAPI(title="Recipe LLM Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/generate-recipe", response_model=RecipeDetail)
def generate_recipe_endpoint(req: GenerateRecipeRequest):
    return generate_recipe(req)
