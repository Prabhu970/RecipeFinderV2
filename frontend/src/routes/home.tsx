import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { RecipeGrid } from "../components/recipe/RecipeGrid";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { ErrorState } from "../components/common/ErrorState";

export function HomeRoute() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const result = await api.getRecommendedRecipes();
        setRecipes(result || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load recommended recipes");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Loading recommended recipes..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <section className="stack">
      <div className="page-header">
        <h1 className="page-title">Recommended for you</h1>
        <p className="page-subtitle">
          Curated recipes powered by Supabase and AI Chef.
        </p>
      </div>

      <RecipeGrid recipes={recipes} />
    </section>
  );
}
