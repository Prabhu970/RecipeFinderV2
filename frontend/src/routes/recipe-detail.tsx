import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import { useFavoritesContext } from '../context/FavoritesContext';

export function RecipeDetailRoute() {
  const { id } = useParams<{ id: string }>();
  const { favorites, toggleFavorite } = useFavoritesContext();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['recipe', id],
    queryFn: () => api.getRecipeDetail(id!),
    enabled: !!id
  });

  if (!id) return <ErrorState message="Missing recipe id." />;
  if (isLoading) return <LoadingSpinner label="Loading recipe..." />;
  if (isError || !data) return <ErrorState onRetry={refetch} />;

  const isFavorite = favorites.includes(data.id);

  return (
    <article className="stack">
      <header className="flex-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="stack">
          <h1 className="page-title">{data.title}</h1>
          <p className="page-subtitle">
            {data.cookTimeMinutes && `${data.cookTimeMinutes} min`}
            {data.difficulty && ` · ${data.difficulty}`}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => toggleFavorite(data.id)}
        >
          {isFavorite ? '★ Saved' : '☆ Save'}
        </button>
      </header>
      {data.imageUrl && (
        <div style={{ borderRadius: 14, overflow: 'hidden' }}>
          <img
            src={data.imageUrl}
            alt={data.title}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      )}
      <section className="flex-row" style={{ gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: 260 }}>
          <h2 style={{ fontSize: '1rem' }}>Steps</h2>
          <ol style={{ paddingLeft: '1.1rem', fontSize: '0.85rem', lineHeight: 1.6 }}>
            {data.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>
        <aside style={{ flex: 1, minWidth: 220 }}>
          <h2 style={{ fontSize: '1rem' }}>Ingredients</h2>
          <ul style={{ paddingLeft: '1.1rem', fontSize: '0.85rem', lineHeight: 1.6 }}>
            {data.ingredients.map((ing, i) => (
              <li key={i}>{ing}</li>
            ))}
          </ul>
        </aside>
      </section>
    </article>
  );
}
