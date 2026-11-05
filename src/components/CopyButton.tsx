'use client';
import { useState } from 'react';
import { Icon } from './Icons';

export function CopyButton({ text, label, variant = 'secondary' }: { text: string; label: string; variant?: 'secondary' | 'primary' }) {
  const [done, setDone] = useState(false);
  return (
    <>
      <button type="button" className={variant === 'primary' ? 'btn' : 'btn secondary'} onClick={async () => {
        try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 2000); } catch { setDone(false); }
      }}>{done ? <><Icon name="check" size={16} /> Copied</> : <><Icon name="copy" size={16} /> {label}</>}</button>
      <span className="sr" role="status">{done ? 'Copied to clipboard' : ''}</span>
    </>
  );
}
