import { supabase } from "./supabaseClient";

const NODE_API_URL = import.meta.env.VITE_NODE_API_URL;
const PYTHON_LLM_URL = import.meta.env.VITE_PYTHON_LLM_URL;

export type RecipeSummary = {
  id: string;
  title: string;
  imageUrl?: string;
  cookTimeMinutes?: number;
  difficulty?: "easy" | "medium" | "hard" | string;
  rating?: number;
  tags?: string[];
};

export type RecipeDetail = RecipeSummary & {
  ingredients: string[];
  steps: string[];
  servings?: number;
  calories?: number;
};

async function handleResponse<T = any>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed with ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export const api = {
  async getRecommendedRecipes(): Promise<RecipeSummary[]> {
    const res = await fetch(`${NODE_API_URL}/recipes/recommended`);
    return handleResponse<RecipeSummary[]>(res);
  },

  async searchRecipes(params: { q?: string; diet?: string; maxTime?: number }): Promise<RecipeSummary[]> {
    const url = new URL(`${NODE_API_URL}/recipes/search`);
    if (params.q) url.searchParams.set("q", params.q);
    if (params.diet) url.searchParams.set("diet", params.diet);
    if (params.maxTime) url.searchParams.set("maxTime", String(params.maxTime));
    const res = await fetch(url.toString());
    return handleResponse<RecipeSummary[]>(res);
  },

  async getRecipeDetail(id: string): Promise<RecipeDetail> {
    const res = await fetch(`${NODE_API_URL}/recipes/${id}`);
    return handleResponse<RecipeDetail>(res);
  },

  async generateAIRecipe(payload: {
    title?: string;
    ingredients: string[];
    servings?: number;
    dietaryTags?: string[];
  }): Promise<RecipeDetail> {
    const res = await fetch(`${PYTHON_LLM_URL}/generate-recipe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<RecipeDetail>(res);
  },

  async getIngredientSubstitutions(payload: {
    recipeTitle: string;
    ingredients: string[];
  }): Promise<{ suggestions: string[] }> {
    const res = await fetch(`${PYTHON_LLM_URL}/ingredient-substitutions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ suggestions: string[] }>(res);
  },

  async saveRating(input: {
    recipeId: string;
    rating: number;
    review: string;
    token: string;
  }) {
    const res = await fetch(`${NODE_API_URL}/ratings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${input.token}`,
      },
      body: JSON.stringify({
        recipeId: input.recipeId,
        rating: input.rating,
        review: input.review,
      }),
    });
    return handleResponse(res);
  },

  async getRatings(recipeId: string, token: string) {
    const res = await fetch(`${NODE_API_URL}/ratings/${recipeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse<any[]>(res);
  },

  async addShoppingItems(recipeId: string, items: string[], token: string) {
    const res = await fetch(`${NODE_API_URL}/shopping-list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ recipeId, items }),
    });
    return handleResponse(res);
  },

  async getShoppingList(token: string) {
    const res = await fetch(`${NODE_API_URL}/shopping-list`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse<any[]>(res);
  },

  async deleteShoppingItem(id: string, token: string) {
    const res = await fetch(`${NODE_API_URL}/shopping-list/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(res);
  },

  async getFavorites(token: string): Promise<string[]> {
    const res = await fetch(`${NODE_API_URL}/favorites`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse<string[]>(res);
  },

  async addFavorite(recipeId: string, token: string) {
    const res = await fetch(`${NODE_API_URL}/favorites/${recipeId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(res);
  },

  async removeFavorite(recipeId: string, token: string) {
    const res = await fetch(`${NODE_API_URL}/favorites/${recipeId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(res);
  },

  async getProfile(token: string) {
    const res = await fetch(`${NODE_API_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse<any>(res);
  },

  async updateProfile(token: string, profile: any) {
    const res = await fetch(`${NODE_API_URL}/profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profile),
    });
    return handleResponse<any>(res);
  },

  async uploadAvatar(file: File, userId: string): Promise<string> {
    const filePath = `${userId}/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(filePath, file);
    if (error) {
      throw error;
    }
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);
    return urlData.publicUrl;
  },
};
