import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { RecipeGrid } from '../components/recipe/RecipeGrid';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { RecipeFilters } from '../components/recipe/RecipeFilters';

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

  const handleSubmit = () => {
    setSubmitted(true);
    searchQuery.refetch();
  };

  return (
    <section className="space-y-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Search recipes</h1>
        <p className="text-sm text-muted-foreground">
          Filter by dietary needs, cooking time and more.
        </p>
      </header>

      <RecipeFilters
        query={query}
        onQueryChange={setQuery}
        diet={diet}
        onDietChange={setDiet}
        maxTime={maxTime}
        onMaxTimeChange={setMaxTime}
        onSubmit={handleSubmit}
      />

      {searchQuery.isLoading && <LoadingSpinner label="Finding matching recipes..." />}

      {searchQuery.isSuccess && (searchQuery.data?.length ?? 0) === 0 && (
        <EmptyState
          title="No recipes found"
          description="Try adjusting your filters or searching for a more general term."
        />
      )}

      {searchQuery.isSuccess && searchQuery.data && searchQuery.data.length > 0 && (
        <RecipeGrid recipes={searchQuery.data} />
      )}
    </section>
  );
}
