import { useState, FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api, type RecipeDetail } from '../lib/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export function AIGeneratorRoute() {
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [servings, setServings] = useState<number | undefined>(2);
  const [tags, setTags] = useState('');
  const [result, setResult] = useState<RecipeDetail | null>(null);

  const mutation = useMutation({
    mutationFn: api.generateAIRecipe,
    onSuccess(data) {
      setResult(data);
    }
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const ingredientsList = ingredients
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);
    const tagList = tags
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    mutation.mutate({
      title: title || undefined,
      ingredients: ingredientsList,
      servings,
      dietaryTags: tagList
    });
  }

  return (
    <section className="stack">
      <div className="page-header">
        <h1 className="page-title">AI Chef</h1>
        <p className="page-subtitle">Paste what you have, get a full recipe back.</p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex-row"
        style={{ gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}
      >
        <div className="stack" style={{ flex: 1, minWidth: 260 }}>
          <div className="form-row">
            <span className="label">Title (optional)</span>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Cozy autumn pasta..."
            />
          </div>
          <div className="form-row">
            <span className="label">Ingredients you have</span>
            <textarea
              className="textarea"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="chicken, garlic, tomato, olive oil..."
            />
          </div>
          <div className="flex-row" style={{ gap: '0.6rem' }}>
            <div className="form-row" style={{ width: 100 }}>
              <span className="label">Servings</span>
              <input
                className="input"
                type="number"
                min={1}
                max={12}
                value={servings ?? ''}
                onChange={(e) =>
                  setServings(e.target.value === '' ? undefined : Number(e.target.value))
                }
              />
            </div>
            <div className="form-row" style={{ flex: 1 }}>
              <span className="label">Dietary tags</span>
              <input
                className="input"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="vegetarian, high protein..."
              />
            </div>
          </div>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Generating...' : 'Generate recipe'}
          </button>
        </div>
        <div
          className="stack"
          style={{
            flex: 1,
            minWidth: 260,
            borderRadius: 12,
            border: '1px solid rgba(31,41,55,1)',
            padding: '0.9rem'
          }}
        >
          {mutation.isPending && <LoadingSpinner label="Asking the AI chef..." />}
          {!mutation.isPending && !result && (
            <p className="muted" style={{ fontSize: '0.8rem' }}>
              Your AI-generated recipe will appear here with ingredients and step-by-step
              instructions.
            </p>
          )}
          {result && (
            <div className="stack">
              <h2 style={{ fontSize: '1rem' }}>{result.title}</h2>
              <p className="muted" style={{ fontSize: '0.8rem' }}>
                {result.cookTimeMinutes && `${result.cookTimeMinutes} min`} · Serves{' '}
                {result.servings ?? 2}
              </p>
              <div>
                <h3 style={{ fontSize: '0.9rem' }}>Ingredients</h3>
                <ul style={{ paddingLeft: '1.1rem', fontSize: '0.8rem' }}>
                  {result.ingredients.map((i, idx) => (
                    <li key={idx}>{i}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 style={{ fontSize: '0.9rem' }}>Steps</h3>
                <ol style={{ paddingLeft: '1.1rem', fontSize: '0.8rem', lineHeight: 1.6 }}>
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
