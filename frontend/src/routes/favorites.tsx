import { useFavoritesContext } from '../context/FavoritesContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { RecipeGrid } from '../components/recipe/RecipeGrid';
import { EmptyState } from '../components/common/EmptyState';

export function FavoritesRoute() {
  const { favorites } = useFavoritesContext();
  const { data, isLoading } = useQuery({
    queryKey: ['recipes', 'favorites'],
    queryFn: () => api.getRecommendedRecipes()
  });

  if (isLoading) return <LoadingSpinner label="Loading favorites..." />;

  const favRecipes = (data ?? []).filter((r) => favorites.includes(r.id));

  if (favRecipes.length === 0) {
    return (
      <EmptyState
        title="No favorites yet"
        description="Tap the star on any recipe to save it here."
      />
    );
  }

  return (
    <section className="stack">
      <div className="page-header">
        <h1 className="page-title">Your favorites</h1>
      </div>
      <RecipeGrid recipes={favRecipes} />
    </section>
  );
}
