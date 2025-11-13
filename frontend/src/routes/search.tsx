import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { RecipeGrid } from '../components/recipe/RecipeGrid';
import { RecipeFilters } from '../components/recipe/RecipeFilters';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export function SearchRoute() {
  const [query, setQuery] = useState('');
  const [diet, setDiet] = useState('');
  const [maxTime, setMaxTime] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const searchQuery = useQuery({
    queryKey: ['search', { query, diet, maxTime }],
    queryFn: () => api.searchRecipes({ q: query, diet, maxTime: maxTime ?? undefined }),
    enabled: submitted
  });

  function handleSubmit() {
    setSubmitted(true);
    searchQuery.refetch();
  }

  return (
    <section className="stack">
      <div className="page-header">
        <h1 className="page-title">Find the perfect recipe</h1>
        <p className="page-subtitle">Use filters to narrow things down.</p>
      </div>
      <RecipeFilters
        query={query}
        onQueryChange={setQuery}
        diet={diet}
        onDietChange={setDiet}
        maxTime={maxTime}
        onMaxTimeChange={setMaxTime}
        onSubmit={handleSubmit}
      />
      {searchQuery.isLoading && <LoadingSpinner label="Searching recipes..." />}
      {searchQuery.isSuccess && (searchQuery.data?.length ?? 0) === 0 && (
        <EmptyState title="No recipes found" description="Try changing or removing filters." />
      )}
      {searchQuery.isSuccess && searchQuery.data && searchQuery.data.length > 0 && (
        <RecipeGrid recipes={searchQuery.data} />
      )}
    </section>
  );
}
