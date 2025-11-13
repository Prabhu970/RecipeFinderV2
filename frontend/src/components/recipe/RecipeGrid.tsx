import type { RecipeSummary } from '../../lib/api';
import { RecipeCard } from './RecipeCard';

export function RecipeGrid({ recipes }: { recipes: RecipeSummary[] }) {
  return (
    <div className="grid-recipes">
      {recipes.map((r) => (
        <RecipeCard key={r.id} recipe={r} />
      ))}
    </div>
  );
}
