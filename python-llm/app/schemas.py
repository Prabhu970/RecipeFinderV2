from pydantic import BaseModel
from typing import List, Optional


class GenerateRecipeRequest(BaseModel):
    title: Optional[str] = None
    ingredients: List[str]
    servings: Optional[int] = None
    dietary_tags: Optional[List[str]] = None


class RecipeDetail(BaseModel):
    id: str
    title: str
    ingredients: List[str]
    steps: List[str]
    servings: Optional[int] = None
    calories: Optional[int] = None
    cook_time_minutes: Optional[int] = None
    difficulty: Optional[str] = None
    rating: Optional[float] = None
    tags: Optional[List[str]] = None
    image_url: Optional[str] = None