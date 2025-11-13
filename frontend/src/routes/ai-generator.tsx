import { FormEvent, useState } from 'react';
import { useAIGenerator } from '../hooks/useAIGenerator';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { RecipeDetailRoute } from './recipe-detail'; // not ideal, but reuse types
import type { RecipeDetail } from '../lib/api';

export function AIGeneratorRoute() {
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [servings, setServings] = useState<number | undefined>(2);
  const [dietaryTags, setDietaryTags] = useState('');
  const [result, setResult] = useState<RecipeDetail | null>(null);

  const mutation = useAIGenerator();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setResult(null);
    const ingredientList = ingredients
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);

    const tags = dietaryTags
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await mutation.mutateAsync({
      title: title || undefined,
      ingredients: ingredientList,
      servings,
      dietaryTags: tags
    });

    setResult(res);
  }

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">AI Recipe Generator</h1>
        <p className="text-sm text-muted-foreground">
          Describe what you have and let the AI build a recipe around it.
        </p>
      </header>

      <form className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.8fr)]" onSubmit={handleSubmit}>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Optional title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Cozy autumn pasta, quick weekday curry..."
              className="w-full h-9 rounded-md border px-2 text-sm bg-background"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Ingredients you have</label>
            <textarea
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="chicken breast, garlic, tomatoes, olive oil..."
              rows={5}
              className="w-full rounded-md border px-2 py-2 text-sm bg-background"
            />
            <p className="text-[11px] text-muted-foreground">
              Separate items with new lines or commas.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Servings</label>
              <input
                type="number"
                min={1}
                max={12}
                value={servings ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  setServings(v === '' ? undefined : Number(v));
                }}
                className="w-full h-9 rounded-md border px-2 text-sm bg-background"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Dietary tags (optional)
              </label>
              <input
                type="text"
                value={dietaryTags}
                onChange={(e) => setDietaryTags(e.target.value)}
                placeholder="vegetarian, high protein..."
                className="w-full h-9 rounded-md border px-2 text-sm bg-background"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {mutation.isPending ? 'Generating...' : 'Generate recipe'}
          </button>
        </div>

        <div className="border rounded-lg min-h-[200px] p-3">
          {mutation.isPending && <LoadingSpinner label="Asking the AI chef..." />}
          {!mutation.isPending && !result && (
            <p className="text-sm text-muted-foreground">
              Your generated recipe will appear here with ingredients and step-by-step instructions.
            </p>
          )}
          {result && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight">{result.title}</h2>
              <p className="text-xs text-muted-foreground">
                {result.cookTimeMinutes && `${result.cookTimeMinutes} minutes`} • Serves{' '}
                {result.servings ?? 2}
              </p>
              <div>
                <h3 className="text-sm font-medium mb-1">Ingredients</h3>
                <ul className="list-disc pl-5 text-sm">
                  {result.ingredients.map((i, idx) => (
                    <li key={idx}>{i}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">Steps</h3>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  {result.steps.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      </form>
    </section>
  );
}
