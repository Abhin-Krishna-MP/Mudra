'use client';
import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { MxIcon, type MxIconName } from './MxIcon';

export interface Suggestion { title: string; kind: string; icon: MxIconName; href?: string }

const DEFAULTS: Suggestion[] = [
  { title: 'Theyyam', kind: 'Art form', icon: 'flame' },
  { title: 'Panchuruli Theyyam', kind: 'Art form', icon: 'flame' },
  { title: 'Kathakali', kind: 'Art form', icon: 'mask' },
  { title: 'Mural Painting', kind: 'Art form', icon: 'palette' },
  { title: 'Kalaripayattu', kind: 'Art form', icon: 'sword' },
  { title: 'Aranmula Kannadi', kind: 'Craft', icon: 'layers' },
  { title: 'Kasavu handloom', kind: 'Craft', icon: 'layers' },
  { title: 'Folk arts', kind: 'Art form', icon: 'mask' },
  { title: 'Verify a record', kind: 'Tool', icon: 'shield', href: '/verify' },
  { title: 'Check an image', kind: 'Tool', icon: 'scan', href: '/check' },
  { title: 'Reuse Studio', kind: 'Tool', icon: 'layers', href: '/reuse' },
];

/**
 * The hero's primary action: a search "command bar".
 *  - Ctrl/⌘ + K focuses it from anywhere
 *  - suggestions open on focus, filter as you type, ↑ ↓ Enter Esc work (WAI-ARIA combobox)
 *  - Enter with free text goes to /catalogue?q=…   (real <form action>, so it also works without JS)
 */
export function HeroSearch({ suggestions = DEFAULTS, placeholder = 'Search for a work, community, festival…' }: { suggestions?: Suggestion[]; placeholder?: string }) {
  const id = useId();
  const listId = `${id}-list`;
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(-1);
  const [mod, setMod] = useState('Ctrl');
  const [ph, setPh] = useState(placeholder);

  const shown = useMemo(() => {
    const n = q.trim().toLowerCase();
    return suggestions.filter((s) => !n || s.title.toLowerCase().includes(n)).slice(0, 6);
  }, [q, suggestions]);

  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) setMod('⌘');
    const mq = window.matchMedia('(max-width: 560px)');
    const f = () => setPh(mq.matches ? 'Search a work, festival…' : placeholder);
    f(); mq.addEventListener('change', f);
    const key = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        inputRef.current?.focus(); inputRef.current?.select();
      }
    };
    const away = (e: MouseEvent) => { if (formRef.current && !formRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('keydown', key); document.addEventListener('click', away);
    return () => { mq.removeEventListener('change', f); document.removeEventListener('keydown', key); document.removeEventListener('click', away); };
  }, [placeholder]);

  const go = (s?: Suggestion, text?: string) => {
    setOpen(false);
    if (s?.href) { window.location.href = s.href; return; }
    const term = (s?.title ?? text ?? q).trim();
    window.location.href = term ? `/catalogue?q=${encodeURIComponent(term)}` : '/catalogue';
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setSel(shown.length ? (sel + 1) % shown.length : -1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(shown.length ? (sel - 1 + shown.length) % shown.length : -1); }
    else if (e.key === 'Escape') { if (open) setOpen(false); else inputRef.current?.blur(); }
  };

  const hl = (t: string) => {
    const n = q.trim().toLowerCase(); const at = n ? t.toLowerCase().indexOf(n) : -1;
    if (at < 0) return t;
    return <>{t.slice(0, at)}<mark>{t.slice(at, at + n.length)}</mark>{t.slice(at + n.length)}</>;
  };

  return (
    <form ref={formRef} className="mx-search" role="search" action="/catalogue" method="get" autoComplete="off"
      onSubmit={(e) => { e.preventDefault(); go(sel > -1 ? shown[sel] : undefined); }}>
      <div className="mx-field">
        <MxIcon name="search" />
        <label className="mx-sr" htmlFor={`${id}-q`}>Search for a work, community or festival</label>
        <input ref={inputRef} className="mx-input" id={`${id}-q`} type="search" name="q" value={q} placeholder={ph} spellCheck={false}
          role="combobox" aria-expanded={open} aria-controls={listId} aria-autocomplete="list"
          aria-activedescendant={sel > -1 ? `${id}-o${sel}` : undefined}
          onFocus={() => setOpen(true)} onChange={(e) => { setQ(e.target.value); setSel(-1); setOpen(true); }} onKeyDown={onKey} />
        <span className="mx-kbd" aria-hidden="true"><span>{mod}</span><span>K</span></span>
        <button className="mx-go" type="submit" aria-label="Search"><MxIcon name="arrow" /></button>
      </div>

      <ul className={`mx-suggest${open ? ' is-open' : ''}`} id={listId} role="listbox" aria-label="Suggestions" onMouseDown={(e) => e.preventDefault()}>
        <li className="mx-sg-head" role="presentation">{q.trim() ? 'Matches' : 'Popular in the catalogue'}</li>
        {shown.length === 0 && <li className="mx-sg-empty" role="presentation">No suggestions — press Enter to search the whole catalogue for “{q.trim()}”.</li>}
        {shown.map((s, i) => (
          <li key={s.title} id={`${id}-o${i}`} className="mx-sg-item" role="option" aria-selected={i === sel} onClick={() => { setQ(s.title); go(s); }}>
            <MxIcon name={s.icon} /><span>{hl(s.title)}</span><small>{s.kind}</small>
          </li>
        ))}
      </ul>
    </form>
  );
}

export default HeroSearch;
