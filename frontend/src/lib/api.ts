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
    let msg = `Request failed with ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) msg = data.error;
    } catch {}
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export const api = {
  /** -------------------------------------------------
   *  GET RECOMMENDED (returns safe + unsafe)
   * -------------------------------------------------- */
  async getRecommendedRecipes(): Promise<{
    safe: RecipeSummary[];
    unsafe: RecipeSummary[];
  }> {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;

    const res = await fetch(`${NODE_API_URL}/recipes/recommended`, {
      headers: { "user-id": userId || "" },
    });

    return handleResponse(res);
  },

  /** -------------------------------------------------
   *  SEARCH (Base results from Node)
   * -------------------------------------------------- */
  async searchRecipes(params: {
    q?: string;
    diet?: string;
    maxTime?: number;
  }): Promise<RecipeSummary[]> {
    const url = new URL(`${NODE_API_URL}/recipes/search`);
    if (params.q) url.searchParams.set("q", params.q);
    if (params.diet) url.searchParams.set("diet", params.diet);
    if (params.maxTime) url.searchParams.set("maxTime", String(params.maxTime));

    const res = await fetch(url);
    return handleResponse(res);
  },

  /** -------------------------------------------------
   *  LLM Search with allergy filtering
   * -------------------------------------------------- */
  async searchRecipesLLM(params: {
    query: string;
    diet: string;
    maxTime?: number;
    ingredient?: string;
    cuisine?: string;
    mealType?: string;
    allergies: string;
  }) {
    const base = await api.searchRecipes({
      q: params.query,
      diet: params.diet,
      maxTime: params.maxTime,
    });

    const res = await fetch(`${PYTHON_LLM_URL}/filter-recipes-by-allergy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allergies: params.allergies, recipes: base }),
    });

    return handleResponse(res);
  },

  /** -------------------------------------------------
   *  RECIPE DETAILS
   * -------------------------------------------------- */
  async getRecipeDetail(id: string): Promise<RecipeDetail> {
    const res = await fetch(`${NODE_API_URL}/recipes/${id}`);
    return handleResponse(res);
  },

  /** -------------------------------------------------
   *  AI RECIPE GENERATION
   * -------------------------------------------------- */
  async generateAIRecipe(payload: {
    title?: string;
    ingredients: string[];
    servings?: number;
    dietaryTags?: string[];
  }) {
    const res = await fetch(`${PYTHON_LLM_URL}/generate-recipe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  /** -------------------------------------------------
   *  AI INGREDIENT SUBSTITUTION
   * -------------------------------------------------- */
  async getIngredientSubstitutions(payload: {
    recipeTitle: string;
    ingredients: string[];
  }) {
    const res = await fetch(`${PYTHON_LLM_URL}/ingredient-substitutions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  /** -------------------------------------------------
   *  RATINGS
   * -------------------------------------------------- */
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
    return handleResponse(res);
  },

  /** -------------------------------------------------
   *  SHOPPING LIST
   * -------------------------------------------------- */
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
    return handleResponse(res);
  },

  async deleteShoppingItem(id: string, token: string) {
    const res = await fetch(`${NODE_API_URL}/shopping-list/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(res);
  },

  /** -------------------------------------------------
   *  FAVORITES
   * -------------------------------------------------- */
  async getFavorites(token: string) {
    const res = await fetch(`${NODE_API_URL}/favorites`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(res);
  },

  async addFavorite(id: string, token: string) {
    const res = await fetch(`${NODE_API_URL}/favorites/${id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(res);
  },

  async removeFavorite(id: string, token: string) {
    const res = await fetch(`${NODE_API_URL}/favorites/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(res);
  },

  /** -------------------------------------------------
   *  PROFILE
   * -------------------------------------------------- */
  async getProfile(token: string) {
    const res = await fetch(`${NODE_API_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(res);
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
    return handleResponse(res);
  },

  /** -------------------------------------------------
   *  AVATAR UPLOAD
   * -------------------------------------------------- */
  async uploadAvatar(file: File, userId: string) {
    const path = `${userId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file);
    if (error) throw error;

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
  },
};
