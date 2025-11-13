interface Props {
  query: string;
  onQueryChange: (v: string) => void;
  diet: string;
  onDietChange: (v: string) => void;
  maxTime: number | null;
  onMaxTimeChange: (v: number | null) => void;
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
}: Props) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex-row"
      style={{ gap: '0.6rem', flexWrap: 'wrap', alignItems: 'flex-end' }}
    >
      <div className="form-row" style={{ minWidth: 180 }}>
        <span className="label">Search</span>
        <input
          className="input"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="chicken, pasta..."
        />
      </div>
      <div className="form-row" style={{ minWidth: 140 }}>
        <span className="label">Diet</span>
        <select
          className="select"
          value={diet}
          onChange={(e) => onDietChange(e.target.value)}
        >
          <option value="">Any</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="vegan">Vegan</option>
          <option value="gluten-free">Gluten-free</option>
        </select>
      </div>
      <div className="form-row" style={{ width: 120 }}>
        <span className="label">Max time</span>
        <input
          className="input"
          type="number"
          value={maxTime ?? ''}
          min={0}
          onChange={(e) =>
            onMaxTimeChange(e.target.value === '' ? null : Number(e.target.value))
          }
        />
      </div>
      <button type="submit" className="btn btn-primary btn-sm">
        Search
      </button>
    </form>
  );
}
