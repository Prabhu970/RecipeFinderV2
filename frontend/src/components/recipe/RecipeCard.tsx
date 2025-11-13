import { Link } from 'react-router-dom';
import type { RecipeSummary } from '../../lib/api';
import { Card, CardBody } from '../ui/card';
import { Badge } from '../ui/badge';
import { useFavoritesContext } from '../../context/FavoritesContext';

interface Props {
  recipe: RecipeSummary;
}

export function RecipeCard({ recipe }: Props) {
  const { favorites, toggleFavorite } = useFavoritesContext();
  const isFavorite = favorites.includes(recipe.id);

  return (
    <Link to={`/recipes/${recipe.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <Card>
        <div style={{ position: 'relative' }}>
          {recipe.imageUrl && (
            <div style={{ aspectRatio: '16 / 9', overflow: 'hidden' }}>
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(recipe.id);
            }}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              borderRadius: '999px',
              paddingInline: 10,
              background: 'rgba(15,23,42,0.8)',
            }}
            aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          >
            <span style={{ fontSize: '0.9rem' }}>{isFavorite ? '★' : '☆'}</span>
          </button>
        </div>

        <CardBody>
          <h3 className="card-title">{recipe.title}</h3>
          <p className="card-meta">
            {recipe.cookTimeMinutes && `${recipe.cookTimeMinutes} min`}
            {recipe.difficulty && ` · ${recipe.difficulty}`}
            {typeof recipe.rating === 'number' && ` · ⭐ ${recipe.rating.toFixed(1)}`}
          </p>
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="card-tags">
              {recipe.tags.slice(0, 3).map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </Link>
  );
}
