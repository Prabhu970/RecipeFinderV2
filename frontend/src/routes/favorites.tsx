import { useFavoritesContext } from '../context/FavoritesContext';
import { useRecipes } from '../hooks/useRecipes';
import { RecipeGrid } from '../components/recipe/RecipeGrid';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export function FavoritesRoute() {
  const { favorites } = useFavoritesContext();
  const { data, isLoading } = useRecipes();

  if (isLoading) return <LoadingSpinner label="Loading your favorites..." />;

  const favoriteRecipes = (data ?? []).filter((r) => favorites.includes(r.id));

  if (favoriteRecipes.length === 0) {
    return (
      <EmptyState
        title="No favorites yet"
        description="Save recipes you love and they will show up here."
      />
    );
  }

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Your favorites</h1>
        <p className="text-sm text-muted-foreground">Quick access to your saved recipes.</p>
      </header>
      <RecipeGrid recipes={favoriteRecipes} />
    </section>
  );
}
