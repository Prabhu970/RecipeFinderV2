import { useRecipes } from '../hooks/useRecipes';
import { RecipeGrid } from '../components/recipe/RecipeGrid';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';

export function HomeRoute() {
  const { data, isLoading, isError, refetch } = useRecipes();

  if (isLoading) return <LoadingSpinner label="Loading recommended recipes..." />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Recommended for you</h1>
          <p className="text-sm text-muted-foreground">
            Hand-picked recipes based on what&apos;s popular right now.
          </p>
        </div>
      </header>
      <RecipeGrid recipes={data ?? []} />
    </section>
  );
}
