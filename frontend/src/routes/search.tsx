import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, type RecipeSummary } from '../lib/api';
import { RecipeGrid } from '../components/recipe/RecipeGrid';
import { RecipeFilters } from '../components/recipe/RecipeFilters';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export function SearchRoute() {
  const [query, setQuery] = useState('');
  const [diet, setDiet] = useState('');
  const [maxTime, setMaxTime] = useState<number | null>(null);
  const [ingredient, setIngredient] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [mealType, setMealType] = useState('');
  const [submittedParams, setSubmittedParams] = useState<{
    query: string;
    diet: string;
    maxTime: number | null;
    ingredient: string;
    cuisine: string;
    mealType: string;
  } | null>(null);

  const searchQuery = useQuery({
    queryKey: ['search', submittedParams],
    queryFn: () =>
      api.searchRecipes({
        q: submittedParams?.query ?? '',
        diet: submittedParams?.diet ?? '',
        maxTime: submittedParams?.maxTime ?? undefined
      }),
    enabled: !!submittedParams
  });

  function handleSubmit() {
    setSubmittedParams({ query, diet, maxTime, ingredient, cuisine, mealType });
  }

  function applyClientFilters(recipes: RecipeSummary[]): RecipeSummary[] {
    if (!submittedParams) return recipes;
    let result = [...recipes];

    if (submittedParams.ingredient) {
      const needle = submittedParams.ingredient.toLowerCase();
      result = result.filter((r) =>
        (r.title.toLowerCase().includes(needle) ||
          (r.tags ?? []).some((t) => t.toLowerCase().includes(needle)))
      );
    }

    if (submittedParams.cuisine) {
      const c = submittedParams.cuisine.toLowerCase();
      result = result.filter((r) =>
        (r.tags ?? []).some((t) => t.toLowerCase() === c)
      );
    }

    if (submittedParams.mealType) {
      const m = submittedParams.mealType.toLowerCase();
      result = result.filter((r) =>
        (r.tags ?? []).some((t) => t.toLowerCase() === m)
      );
    }

    return result;
  }

  const filtered = searchQuery.data ? applyClientFilters(searchQuery.data) : [];

  return (
    <section className="stack">
      <div className="page-header">
        <h1 className="page-title">Find the perfect recipe</h1>
        <p className="page-subtitle">Search by ingredient, cuisine, diet, or meal type.</p>
      </div>

      <div className="stack" style={{ gap: '0.75rem' }}>
        <RecipeFilters
          query={query}
          onQueryChange={setQuery}
          diet={diet}
          onDietChange={setDiet}
          maxTime={maxTime}
          onMaxTimeChange={setMaxTime}
          onSubmit={handleSubmit}
        />

        <div
          className="flex-row"
          style={{ gap: '0.6rem', flexWrap: 'wrap', alignItems: 'flex-end' }}
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
        </div>
      </div>

      {searchQuery.isLoading && <LoadingSpinner label="Searching recipes..." />}
      {searchQuery.isSuccess && filtered.length === 0 && (
        <EmptyState title="No recipes found" description="Try adjusting your filters." />
      )}
      {searchQuery.isSuccess && filtered.length > 0 && (
        <RecipeGrid recipes={filtered} />
      )}
    </section>
  );
}
