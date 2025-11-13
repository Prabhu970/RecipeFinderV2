interface RecipeFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  diet: string;
  onDietChange: (value: string) => void;
  maxTime: number | null;
  onMaxTimeChange: (value: number | null) => void;
  onSubmit: () => void;
}

export function RecipeFilters({
  query,
  onQueryChange,
  diet,
  onDietChange,
  maxTime,
  onMaxTimeChange,
  onSubmit
}: RecipeFiltersProps) {
  return (
    <form
      className="flex flex-wrap gap-2 items-end"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">Search</label>
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Chicken, pasta, quick dinner..."
          className="h-9 rounded-md border px-2 text-sm bg-background"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">Diet</label>
        <select
          value={diet}
          onChange={(e) => onDietChange(e.target.value)}
          className="h-9 rounded-md border px-2 text-sm bg-background"
        >
          <option value="">Any</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="vegan">Vegan</option>
          <option value="gluten-free">Gluten-free</option>
          <option value="keto">Keto</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">Max time (min)</label>
        <input
          type="number"
          min={0}
          value={maxTime ?? ''}
          onChange={(e) => {
            const v = e.target.value;
            onMaxTimeChange(v === '' ? null : Number(v));
          }}
          className="h-9 w-28 rounded-md border px-2 text-sm bg-background"
        />
      </div>
      <button
        type="submit"
        className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Search
      </button>
    </form>
  );
}
