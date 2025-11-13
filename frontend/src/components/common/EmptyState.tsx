export function EmptyState({
  title,
  description
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="stack" style={{ alignItems: 'center', padding: '2rem 0', textAlign: 'center' }}>
      <h2 style={{ fontSize: '0.95rem' }}>{title}</h2>
      {description && (
        <p className="muted" style={{ fontSize: '0.8rem', maxWidth: 420 }}>{description}</p>
      )}
    </div>
  );
}
