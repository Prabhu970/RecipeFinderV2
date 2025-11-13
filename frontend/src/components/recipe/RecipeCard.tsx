import { Link } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

import type { RecipeSummary } from '../../lib/api';

interface RecipeCardProps {
  recipe: RecipeSummary;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link to={`/recipes/${recipe.id}`} className="block">
      <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
        <CardContent className="p-0 flex flex-col h-full">
          {recipe.imageUrl && (
            <div className="aspect-video overflow-hidden">
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="h-full w-full object-cover transition-transform duration-200 hover:scale-105"
              />
            </div>
          )}
          <div className="flex-1 p-4 flex flex-col gap-2">
            <h3 className="font-semibold line-clamp-2">{recipe.title}</h3>
            <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
              {recipe.cookTimeMinutes && <span>{recipe.cookTimeMinutes} min</span>}
              {recipe.difficulty && <span>• {recipe.difficulty}</span>}
              {typeof recipe.rating === 'number' && <span>• ⭐ {recipe.rating.toFixed(1)}</span>}
            </div>
            {recipe.tags && recipe.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {recipe.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
