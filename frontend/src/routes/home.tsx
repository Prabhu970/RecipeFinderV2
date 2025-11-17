import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { RecipeGrid } from "../components/recipe/RecipeGrid";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { ErrorState } from "../components/common/ErrorState";

export function HomeRoute() {
  const [safeRecipes, setSafeRecipes] = useState([]);
  const [unsafeRecipes, setUnsafeRecipes] = useState([]);
  const [showUnsafe, setShowUnsafe] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const { safe, unsafe } = await api.getRecommendedRecipes();

        setSafeRecipes(safe || []);
        setUnsafeRecipes(unsafe || []);
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
          Curated recipes powered by Supabase, your allergies, and Gemini 2.5 Flash.
        </p>
      </div>

      {/* SAFE RECIPES */}
      <RecipeGrid recipes={safeRecipes} />

      {/* UNSAFE — COLLAPSIBLE */}
      {unsafeRecipes.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <button
            className="btn btn-secondary"
            onClick={() => setShowUnsafe(!showUnsafe)}
          >
            {showUnsafe
              ? "Hide recipes filtered due to your allergies"
              : `Show ${unsafeRecipes.length} filtered recipes (unsafe for you)`}
          </button>

          {showUnsafe && (
            <div style={{ marginTop: "1rem", opacity: 0.7 }}>
              <RecipeGrid recipes={unsafeRecipes} />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
