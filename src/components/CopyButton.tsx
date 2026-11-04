'use client';
import { useState } from 'react';
export function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <>
      <button type="button" className="secondary" onClick={async () => {
        try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 2000); } catch { setDone(false); }
      }}>{done ? 'Copied ✓' : label}</button>
      <span className="sr" role="status">{done ? 'Copied to clipboard' : ''}</span>
    </>
  );
}
