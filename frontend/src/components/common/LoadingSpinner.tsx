export function LoadingSpinner({ label }: { label?: string }) {
  return (
    <div className="stack" style={{ alignItems: 'center', padding: '2rem 0' }}>
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: '999px',
          border: '3px solid rgba(148,163,184,0.5)',
          borderTopColor: '#22c55e',
          animation: 'spin 0.7s linear infinite'
        }}
      />
      {label && (
        <p className="muted" style={{ fontSize: '0.8rem' }}>
          {label}
        </p>
      )}
    </div>
  );
}
