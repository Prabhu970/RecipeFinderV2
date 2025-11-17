import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import { useFavoritesContext } from '../context/FavoritesContext';
import { supabase } from '../lib/supabaseClient';
import type { RecipeDetail, RecipeSummary } from '../lib/api';
import { useState } from 'react';

export function RecipeDetailRoute() {
  const { id } = useParams<{ id: string }>();
  const { favorites, toggleFavorite } = useFavoritesContext();
  const queryClient = useQueryClient();

  const recipeQuery = useQuery({
    queryKey: ['recipe', id],
    queryFn: () => api.getRecipeDetail(id!),
    enabled: !!id
  });

  const recommendedQuery = useQuery({
    queryKey: ['recipes', 'recommendations'],
    queryFn: () => api.getRecommendedRecipes(),
    staleTime: 5 * 60_000
  });

  const [rating, setRating] = useState<number | ''>('');
  const [review, setReview] = useState('');
  const [subsLoading, setSubsLoading] = useState(false);
  const [substitutions, setSubstitutions] = useState<string[] | null>(null);
  const [ratingsToken, setRatingsToken] = useState<string | null>(null);
  const ratingsQuery = useQuery({
    queryKey: ['ratings', id],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return [];
      setRatingsToken(token);
      return api.getRatings(id!, token);
    },
    enabled: !!id
  });

  if (!id) return <ErrorState message="Missing recipe id." />;

  if (recipeQuery.isLoading) return <LoadingSpinner label="Loading recipe..." />;
  if (recipeQuery.isError || !recipeQuery.data) return <ErrorState onRetry={recipeQuery.refetch} />;

  const recipe = recipeQuery.data as RecipeDetail;
  const isFavorite = favorites.includes(recipe.id);

  const similar: RecipeSummary[] =
    recommendedQuery.data?.filter(
      (r) =>
        r.id !== recipe.id &&
        (r.tags ?? []).some((t) => (recipe.tags ?? []).includes(t))
    ).slice(0, 4) ?? [];

async function handleAddToShoppingList() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const user = data.session?.user;

  if (!token || !user) {
    alert("Please sign in to use the shopping list.");
    return;
  }

  // send ingredients array EXACTLY as the backend expects
  const payload = {
    user_id: user.id,
    items: recipe.ingredients
  };

  try {
    const res = await fetch("https://recipefinderv2.onrender.com/shopping-list", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Shopping list error:", err);
      alert(err.error || "Failed to add ingredients.");
      return;
    }

    alert("Ingredients added to your shopping list.");
    queryClient.invalidateQueries(["shopping-list"]);

  } catch (err) {
    console.error("Add to list failed:", err);
    alert("Failed to connect to shopping list API.");
  }
}


  async function requestSubstitutions() {
    setSubsLoading(true);
    try {
      const res = await api.getIngredientSubstitutions({
        recipeTitle: recipe.title,
        ingredients: recipe.ingredients
      });
      setSubstitutions(res.suggestions);
    } catch (err) {
      console.error('Failed to get substitutions', err);
    } finally {
      setSubsLoading(false);
    }
  }

  async function handleSaveRating() {
    if (rating === '' || typeof rating !== 'number') {
      alert('Please select a rating.');
      return;
    }
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      alert('Please sign in to leave a rating.');
      return;
    }
    await api.saveRating({
      recipeId: recipe.id,
      rating,
      review,
      token
    });
    setRating('');
    setReview('');
    queryClient.invalidateQueries(['ratings', id]);
    alert('Thanks for your feedback!');
  }

  return (
    <article className="flex-row" style={{ gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <div style={{ flex: 2, minWidth: 280 }} className="stack">
        <header className="flex-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="stack">
            <h1 className="page-title">{recipe.title}</h1>
            <p className="page-subtitle">
              {recipe.cookTimeMinutes && `${recipe.cookTimeMinutes} min`}
              {recipe.difficulty && ` · ${recipe.difficulty}`}
              {typeof recipe.rating === 'number' && ` · ⭐ ${recipe.rating.toFixed(1)}`}
            </p>
          </div>
          <div className="flex-row" style={{ gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => toggleFavorite(recipe.id)}
            >
              {isFavorite ? '★ Saved' : '☆ Save'}
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleAddToShoppingList}
            >
              🛒 Add ingredients
            </button>
          </div>
        </header>

        {recipe.imageUrl && (
          <div style={{ borderRadius: 14, overflow: 'hidden' }}>
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
        )}

        <section className="flex-row" style={{ gap: '1.2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <h2 style={{ fontSize: '1rem', marginBottom: '0.35rem' }}>Ingredients</h2>
            <ul style={{ paddingLeft: '1.1rem', fontSize: '0.85rem', lineHeight: 1.6 }}>
              {recipe.ingredients.map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
          </div>

          <aside
            style={{
              flex: 1,
              minWidth: 220,
              borderRadius: 12,
              border: '1px solid rgba(31,41,55,1)',
              padding: '0.75rem'
            }}
          >
            <div className="flex-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '0.9rem' }}>AI ingredient substitutions</h3>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={requestSubstitutions}
                disabled={subsLoading}
              >
                {subsLoading ? 'Asking AI...' : 'Suggest'}
              </button>
            </div>
            {substitutions ? (
              <ul style={{ paddingLeft: '1.1rem', fontSize: '0.8rem', marginTop: '0.4rem' }}>
                {substitutions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            ) : (
              <p className="muted" style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>
                AI will suggest alternatives for ingredients you might not have on hand.
              </p>
            )}
          </aside>
        </section>

        <section className="stack">
          <h2 style={{ fontSize: '1rem' }}>Step-by-step instructions</h2>
          <ol style={{ paddingLeft: '1.1rem', fontSize: '0.85rem', lineHeight: 1.6 }}>
            {recipe.steps.map((s, i) => (
              <li key={i} style={{ marginBottom: '0.35rem' }}>
                {s}
              </li>
            ))}
          </ol>
        </section>

        <section className="stack" style={{ marginTop: '1rem' }}>
          <h2 style={{ fontSize: '1rem' }}>Rate & review</h2>
          <div className="flex-row" style={{ gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="label">Your rating</span>
            <select
              className="select"
              value={rating}
              onChange={(e) =>
                setRating(e.target.value === '' ? '' : Number(e.target.value))
              }
              style={{ maxWidth: 150 }}
            >
              <option value="">-</option>
              <option value="5">5 – Loved it</option>
              <option value="4">4 – Great</option>
              <option value="3">3 – OK</option>
              <option value="2">2 – Meh</option>
              <option value="1">1 – Not good</option>
            </select>
          </div>
          <textarea
            className="textarea"
            placeholder="What did you think of this recipe?"
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
          <button className="btn btn-primary btn-sm" type="button" onClick={handleSaveRating}>
            Save feedback
          </button>
        </section>

        <section className="stack" style={{ marginTop: '1rem' }}>
          <h2 style={{ fontSize: '1rem' }}>User reviews</h2>
          {ratingsQuery.isLoading && <p>Loading reviews...</p>}
          {ratingsQuery.data && ratingsQuery.data.length === 0 && <p>No reviews yet.</p>}
          {(ratingsQuery.data ?? []).map((r: any) => (
            <div
              key={r.id}
              style={{
                borderRadius: 10,
                border: '1px solid rgba(31,41,55,1)',
                padding: '0.5rem 0.75rem',
                marginBottom: '0.4rem',
                fontSize: '0.85rem'
              }}
            >
              <div style={{ fontWeight: 500 }}>⭐ {r.rating}</div>
              {r.review && <p style={{ margin: '0.2rem 0 0.1rem' }}>{r.review}</p>}
              <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                {r.created_at && new Date(r.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </section>
      </div>

      <aside
        style={{
          flex: 1,
          minWidth: 240,
          position: 'sticky',
          top: 80,
          alignSelf: 'flex-start'
        }}
        className="stack"
      >
        <h3 style={{ fontSize: '0.9rem' }}>You might also like</h3>
        {similar.length === 0 && (
          <p className="muted" style={{ fontSize: '0.8rem' }}>
            Similar recipes will appear here once you have more data tagged.
          </p>
        )}
        {similar.map((r) => (
          <Link
            key={r.id}
            to={`/recipes/${r.id}`}
            style={{
              display: 'block',
              textDecoration: 'none',
              color: 'inherit',
              borderRadius: 10,
              border: '1px solid rgba(31,41,55,1)',
              padding: '0.55rem 0.7rem',
              fontSize: '0.8rem',
              marginBottom: '0.4rem'
            }}
          >
            <div style={{ fontWeight: 500 }}>{r.title}</div>
            <div className="card-meta">
              {r.cookTimeMinutes && `${r.cookTimeMinutes} min`}
              {r.tags && r.tags.length > 0 && ` · ${r.tags.slice(0, 2).join(', ')}`}
            </div>
          </Link>
        ))}
      </aside>
    </article>
  );
}
