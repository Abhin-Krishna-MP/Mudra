'use client';
import { useId, useRef, useState, useEffect, type KeyboardEvent, type ReactNode } from 'react';
import { Icon, type IconName } from './Icons';

export interface TabDef { id: string; label: string; content: ReactNode; icon?: IconName }

/** Accessible tabs (arrow keys, Home/End). Panel content is rendered by the server and only shown/hidden here. */
export function Tabs({ tabs, label, defaultTab }: { tabs: TabDef[]; label: string; defaultTab?: string }) {
  const initialIndex = defaultTab ? Math.max(0, tabs.findIndex((t) => t.id === defaultTab)) : 0;
  const [active, setActive] = useState(initialIndex >= 0 ? initialIndex : 0);

  const uid = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    // Read initial hash after mount (avoids hydration mismatch)
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      const idx = tabs.findIndex((t) => t.id === hash);
      if (idx >= 0) setActive(idx);
    }
  }, [tabs]);

  useEffect(() => {
    const handleSelect = (e: Event) => {
      const customEvent = e as CustomEvent<{ tabId: string }>;
      if (customEvent.detail?.tabId) {
        const idx = tabs.findIndex((t) => t.id === customEvent.detail.tabId);
        if (idx >= 0) {
          setActive(idx);
          refs.current[idx]?.focus();
        }
      }
    };
    window.addEventListener('mudra:select-tab', handleSelect);
    return () => window.removeEventListener('mudra:select-tab', handleSelect);
  }, [tabs]);

  function onKey(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    let n = i;
    if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = tabs.length - 1;
    else return;
    e.preventDefault(); setActive(n); refs.current[n]?.focus();
  }

  const selectTab = (i: number) => {
    setActive(i);
    if (typeof window !== 'undefined' && tabs[i]) {
      window.history.replaceState(null, '', `#${tabs[i].id}`);
    }
  };

  return (
    <div className="tabs">
      <div role="tablist" aria-label={label} className="tablist">
        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => { refs.current[i] = el; }}
            role="tab"
            type="button"
            id={`${uid}-t-${t.id}`}
            aria-selected={i === active}
            aria-controls={`${uid}-p-${t.id}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => selectTab(i)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {t.icon && <Icon name={t.icon} size={18} />}
            <span>{t.label}</span>
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div key={t.id} role="tabpanel" id={`${uid}-p-${t.id}`} aria-labelledby={`${uid}-t-${t.id}`} hidden={i !== active} tabIndex={0} className="tabpanel">{t.content}</div>
      ))}
    </div>
  );
}
