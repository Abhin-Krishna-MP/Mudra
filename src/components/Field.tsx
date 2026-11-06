import type { ReactNode } from 'react';

/** Label + control + field-level error wired with aria-describedby. */
export function Field({ name, label, error, hint, required, icon, children }: { name: string; label: string; error?: string; hint?: string; required?: boolean; icon?: ReactNode; children: (p: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean; 'aria-required'?: boolean }) => ReactNode }) {
  const ids = [hint ? `${name}-hint` : '', error ? `${name}-err` : ''].filter(Boolean).join(' ') || undefined;
  return (
    <div className="field">
      <label htmlFor={name}>{label}{required && <span className="req" aria-hidden="true"> *</span>}</label>
      {(() => {
        const control = children({ id: name, 'aria-describedby': ids, 'aria-invalid': error ? true : undefined, 'aria-required': required ? true : undefined });
        return icon ? <div className="fi"><span className="fi-ico" aria-hidden="true">{icon}</span>{control}</div> : control;
      })()}
      {hint && <p className="hint" id={`${name}-hint`}>{hint}</p>}
      {error && <p className="err" id={`${name}-err`}><span aria-hidden="true">✕ </span>{error}</p>}
    </div>
  );
}
