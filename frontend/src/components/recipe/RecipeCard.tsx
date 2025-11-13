import { Link } from 'react-router-dom';
import type { RecipeSummary } from '../../lib/api';
import { Card, CardBody } from '../ui/card';
import { Badge } from '../ui/badge';

export function RecipeCard({ recipe }: { recipe: RecipeSummary }) {
  return (
    <Link to={`/recipes/${recipe.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <Card>
        {recipe.imageUrl && (
          <div style={{ aspectRatio: '16 / 9', overflow: 'hidden' }}>
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}
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
