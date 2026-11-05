'use client';
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

export interface TabDef { id: string; label: string; content: ReactNode }

/** Accessible tabs (arrow keys, Home/End). Panel content is rendered by the server and only shown/hidden here. */
export function Tabs({ tabs, label }: { tabs: TabDef[]; label: string }) {
  const [active, setActive] = useState(0);
  const uid = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  function onKey(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    let n = i;
    if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = tabs.length - 1;
    else return;
    e.preventDefault(); setActive(n); refs.current[n]?.focus();
  }
  return (
    <div className="tabs">
      <div role="tablist" aria-label={label} className="tablist">
        {tabs.map((t, i) => (
          <button key={t.id} ref={(el) => { refs.current[i] = el; }} role="tab" type="button" id={`${uid}-t-${t.id}`} aria-selected={i === active} aria-controls={`${uid}-p-${t.id}`} tabIndex={i === active ? 0 : -1} onClick={() => setActive(i)} onKeyDown={(e) => onKey(e, i)}>{t.label}</button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div key={t.id} role="tabpanel" id={`${uid}-p-${t.id}`} aria-labelledby={`${uid}-t-${t.id}`} hidden={i !== active} tabIndex={0} className="tabpanel">{t.content}</div>
      ))}
    </div>
  );
}
