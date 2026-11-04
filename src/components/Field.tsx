import type { ReactNode } from 'react';

/** Label + control + field-level error wired with aria-describedby. */
export function Field({ name, label, error, hint, children }: { name: string; label: string; error?: string; hint?: string; children: (p: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }) => ReactNode }) {
  const ids = [hint ? `${name}-hint` : '', error ? `${name}-err` : ''].filter(Boolean).join(' ') || undefined;
  return (
    <div>
      <label htmlFor={name}>{label}</label>
      {children({ id: name, 'aria-describedby': ids, 'aria-invalid': error ? true : undefined })}
      {hint && <p className="hint" id={`${name}-hint`}>{hint}</p>}
      {error && <p className="err" id={`${name}-err`}>{error}</p>}
    </div>
  );
}
