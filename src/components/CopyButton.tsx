'use client';
import { useState } from 'react';
import { Icon, type IconName } from './Icons';

export function CopyButton({ text, label, variant = 'secondary', icon = 'copy', className = '' }: { text: string; label: string; variant?: 'secondary' | 'primary'; icon?: IconName; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <>
      <button type="button" className={`${variant === 'primary' ? 'btn' : 'btn secondary'}${className ? ` ${className}` : ''}`} onClick={async () => {
        try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 2000); } catch { setDone(false); }
      }}>{done ? <><Icon name="check" size={16} /> Copied</> : <><Icon name={icon} size={16} /> {label}</>}</button>
      <span className="sr" role="status">{done ? 'Copied to clipboard' : ''}</span>
    </>
  );
}
