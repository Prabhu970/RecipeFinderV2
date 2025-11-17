import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, type RecipeSummary } from "../lib/api";
import { RecipeGrid } from "../components/recipe/RecipeGrid";
import { RecipeFilters } from "../components/recipe/RecipeFilters";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { EmptyState } from "../components/common/EmptyState";

export function SearchRoute() {
  const [query, setQuery] = useState("");
  const [diet, setDiet] = useState("");
  const [maxTime, setMaxTime] = useState<number | null>(null);
  const [ingredient, setIngredient] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [mealType, setMealType] = useState("");
  const [allergyFilter, setAllergyFilter] = useState("");

  const [submittedParams, setSubmittedParams] = useState<{
    query: string;
    diet: string;
    maxTime: number | null;
    ingredient: string;
    cuisine: string;
    mealType: string;
    allergyFilter: string;
  } | null>(null);

  // Submit query
  function handleSubmit() {
    setSubmittedParams({
      query,
      diet,
      maxTime,
      ingredient,
      cuisine,
      mealType,
      allergyFilter
    });
  }

  // 🔥 LLM-powered search with allergy filtering
  const searchQuery = useQuery({
    queryKey: ["search", submittedParams],
    queryFn: async () => {
      if (!submittedParams) return { safe: [], unsafe: [] };

      // 1. Get user's stored allergies from profile
      const profile = await api.getUserProfile();
      const profileAllergies = profile?.allergies ?? "";

      // Combine profile allergies + search allergy filter
      const combinedAllergies = [profileAllergies, submittedParams.allergyFilter]
        .filter(Boolean)
        .join(", ");

      // 2. Ask backend (LLM) for safe/unsafe recipe split
      const { safe, unsafe } = await api.searchRecipesLLM({
        query: submittedParams.query,
        diet: submittedParams.diet,
        maxTime: submittedParams.maxTime ?? undefined,
        ingredient: submittedParams.ingredient,
        cuisine: submittedParams.cuisine,
        mealType: submittedParams.mealType,
        allergies: combinedAllergies
      });

      return { safe, unsafe };
    },
    enabled: !!submittedParams
  });

  const isLoading = searchQuery.isLoading;
  const safeRecipes = searchQuery.data?.safe ?? [];
  const unsafeRecipes = searchQuery.data?.unsafe ?? [];

  const [showUnsafe, setShowUnsafe] = useState(false);

  return (
    <section className="stack">
      <div className="page-header">
        <h1 className="page-title">Find the perfect recipe</h1>
        <p className="page-subtitle">
          Search by ingredient, cuisine, diet, meal type — and avoid allergens.
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="stack" style={{ gap: "0.75rem" }}>
        <RecipeFilters
          query={query}
          onQueryChange={setQuery}
          diet={diet}
          onDietChange={setDiet}
          maxTime={maxTime}
          onMaxTimeChange={setMaxTime}
          onSubmit={handleSubmit}
        />

        {/* EXTRA FILTERS */}
        <div
          className="flex-row"
          style={{ gap: "0.6rem", flexWrap: "wrap", alignItems: "flex-end" }}
        >
          <div className="form-row" style={{ minWidth: 180 }}>
            <span className="label">Ingredient</span>
            <input
              className="input"
              value={ingredient}
              onChange={(e) => setIngredient(e.target.value)}
              placeholder="chicken, tofu, tomato..."
            />
          </div>

          <div className="form-row" style={{ minWidth: 160 }}>
            <span className="label">Cuisine</span>
            <select
              className="select"
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
            >
              <option value="">Any</option>
              <option value="italian">Italian</option>
              <option value="indian">Indian</option>
              <option value="mexican">Mexican</option>
              <option value="asian">Asian</option>
              <option value="mediterranean">Mediterranean</option>
            </select>
          </div>

          <div className="form-row" style={{ minWidth: 160 }}>
            <span className="label">Meal type</span>
            <select
              className="select"
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
            >
              <option value="">Any</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>

          {/* NEW 🔥 Allergy Filter */}
          <div className="form-row" style={{ minWidth: 180 }}>
            <span className="label">Allergy Filter</span>
            <input
              className="input"
              value={allergyFilter}
              onChange={(e) => setAllergyFilter(e.target.value)}
              placeholder="lactose, peanuts..."
            />
          </div>
        </div>
      </div>

      {/* RESULTS */}
      {isLoading && <LoadingSpinner label="Searching recipes..." />}

      {!isLoading && safeRecipes.length === 0 && unsafeRecipes.length === 0 && (
        <EmptyState title="No recipes found" description="Try adjusting your filters." />
      )}

      {/* SAFE RECIPES */}
      {safeRecipes.length > 0 && <RecipeGrid recipes={safeRecipes} />}

      {/* UNSAFE (COLLAPSIBLE) */}
      {unsafeRecipes.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <button
            className="btn btn-secondary"
            onClick={() => setShowUnsafe(!showUnsafe)}
          >
            {showUnsafe
              ? "Hide recipes filtered due to allergies"
              : `Show ${unsafeRecipes.length} unsafe recipes`}
          </button>

          {showUnsafe && (
            <div style={{ marginTop: "1rem", opacity: 0.7 }}>
              <RecipeGrid recipes={unsafeRecipes} />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
