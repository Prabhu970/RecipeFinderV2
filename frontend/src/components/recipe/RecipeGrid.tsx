import type { RecipeSummary } from '../../lib/api';
import { RecipeCard } from './RecipeCard';

interface RecipeGridProps {
  recipes: RecipeSummary[];
}

export function RecipeGrid({ recipes }: RecipeGridProps) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}
