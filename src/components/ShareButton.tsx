'use client';
import { useState } from 'react';
import { Icon } from './Icons';

export function ShareButton({ title, className = '' }: { title: string; className?: string }) {
  const [done, setDone] = useState(false);
  async function go() {
    const url = window.location.href.split('#')[0];
    try {
      if (navigator.share) { await navigator.share({ title, url }); return; }
      await navigator.clipboard.writeText(url);
      setDone(true); setTimeout(() => setDone(false), 2000);
    } catch { /* cancelled */ }
  }
  return (
    <>
      <button type="button" className={`btn secondary${className ? ` ${className}` : ''}`} onClick={go}>
        {done ? <><Icon name="check" size={16} /> Link copied</> : <><Icon name="share" size={16} /> Share</>}
      </button>
      <span className="sr" role="status">{done ? 'Link copied to clipboard' : ''}</span>
    </>
  );
}
