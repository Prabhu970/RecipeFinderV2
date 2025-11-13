export function ErrorState({
  message,
  onRetry
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="stack" style={{ alignItems: 'center', padding: '2rem 0', textAlign: 'center' }}>
      <p style={{ color: '#f97373', fontSize: '0.85rem' }}>
        {message ?? 'Something went wrong while loading your recipes.'}
      </p>
      {onRetry && (
        <button type="button" className="btn btn-primary btn-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
