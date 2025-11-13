import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { RecipeGrid } from '../components/recipe/RecipeGrid';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';

export function HomeRoute() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['recipes', 'home'],
    queryFn: () => api.getRecommendedRecipes()
  });

  if (isLoading) return <LoadingSpinner label="Loading recommended recipes..." />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <section className="stack">
      <div className="page-header">
        <h1 className="page-title">Tonight&apos;s inspiration</h1>
        <p className="page-subtitle">
          Curated recipes powered by Supabase and your AI chef.
        </p>
      </div>
      <RecipeGrid recipes={data ?? []} />
    </section>
  );
}
