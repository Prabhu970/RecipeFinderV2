import { useParams } from 'react-router-dom';
import { useRecipeDetail } from '../hooks/useRecipeDetail';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import { useFavoritesContext } from '../context/FavoritesContext';

export function RecipeDetailRoute() {
  const { id } = useParams<{ id: string }>();
  const { favorites, toggleFavorite } = useFavoritesContext();
  const { data, isLoading, isError, refetch } = useRecipeDetail(id ?? '');

  if (!id) return <ErrorState message="Missing recipe id." />;

  if (isLoading) return <LoadingSpinner label="Loading recipe..." />;
  if (isError || !data) return <ErrorState onRetry={refetch} />;

  const isFavorite = favorites.includes(data.id);

  return (
    <article className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{data.title}</h1>
          <p className="text-sm text-muted-foreground">
            {data.cookTimeMinutes && `${data.cookTimeMinutes} minutes`} {data.difficulty && `• ${data.difficulty}`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => toggleFavorite(data.id)}
          className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          {isFavorite ? '★ Remove from favorites' : '☆ Save to favorites'}
        </button>
      </header>

      {data.imageUrl && (
        <div className="aspect-video overflow-hidden rounded-lg">
          <img src={data.imageUrl} alt={data.title} className="h-full w-full object-cover" />
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Steps</h2>
          <ol className="space-y-2 text-sm leading-relaxed">
            {data.steps.map((step, index) => (
              <li key={index}>
                <span className="font-medium mr-2">{index + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Ingredients</h2>
            <ul className="mt-2 list-disc pl-5 text-sm leading-relaxed">
              {data.ingredients.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          {typeof data.servings === 'number' && (
            <p className="text-sm text-muted-foreground">Serves {data.servings}</p>
          )}
          {typeof data.calories === 'number' && (
            <p className="text-sm text-muted-foreground">{data.calories} kcal per serving</p>
          )}
        </div>
      </section>
    </article>
  );
}
