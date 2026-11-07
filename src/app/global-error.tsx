'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <head>
        <title>Something went wrong</title>
      </head>
      <body>
        <div style={{ maxWidth: 600, margin: '60px auto', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
          <h2>Something went wrong</h2>
          <p style={{ color: '#666' }}>{error?.message || 'An unexpected error occurred.'}</p>
          <button
            onClick={() => reset()}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: 0,
              background: '#8c2c25',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

