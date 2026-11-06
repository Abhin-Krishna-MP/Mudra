'use client';
import { useEffect, useState } from 'react';

const KEY = 'mudra-saved';
const read = (): string[] => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };

/** Save-for-later ribbon on a catalogue card. Saved ids live in this browser only (localStorage). */
export function BookmarkButton({ id, title }: { id: string; title: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => { setOn(read().includes(id)); }, [id]);
  const toggle = () => {
    const cur = read();
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage blocked: keep the in-memory state */ }
    setOn(next.includes(id));
  };
  return (
    <button type="button" className="tile-save" aria-pressed={on} aria-label={`${on ? 'Remove' : 'Save'} ${title}`} onClick={toggle}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
        <path d="M6.5 4h11a1 1 0 0 1 1 1v15l-6.5-4-6.5 4V5a1 1 0 0 1 1-1Z" />
      </svg>
    </button>
  );
}
