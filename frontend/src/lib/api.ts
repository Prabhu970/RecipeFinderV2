const NODE_API_URL = import.meta.env.VITE_NODE_API_URL;
const PYTHON_LLM_URL = import.meta.env.VITE_PYTHON_LLM_URL;

export type RecipeSummary = {
  id: string;
  title: string;
  imageUrl?: string;
  cookTimeMinutes?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  rating?: number;
  tags?: string[];
};

export type RecipeDetail = RecipeSummary & {
  ingredients: string[];
  steps: string[];
  servings?: number;
  calories?: number;
};

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json() as Promise<T>;
}

export const api = {
  async getRecommendedRecipes() {
    const res = await fetch(`${NODE_API_URL}/recipes/recommended`);
    return handleResponse<RecipeSummary[]>(res);
  },

  async searchRecipes(params: { q?: string; diet?: string; maxTime?: number }) {
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== '')
        .map(([k, v]) => [k, String(v)])
    );

    const res = await fetch(`${NODE_API_URL}/recipes/search?${query.toString()}`);
    return handleResponse<RecipeSummary[]>(res);
  },

  async getRecipeDetail(id: string) {
    const res = await fetch(`${NODE_API_URL}/recipes/${id}`);
    return handleResponse<RecipeDetail>(res);
  },

  async generateAIRecipe(payload: {
    title?: string;
    ingredients: string[];
    servings?: number;
    dietaryTags?: string[];
  }) {
    const res = await fetch(`${PYTHON_LLM_URL}/generate-recipe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse<RecipeDetail>(res);
  }
};
