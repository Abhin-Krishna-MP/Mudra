'use client';
import { useEffect, useState } from 'react';
import { Icon } from './Icons';

type Theme = 'light' | 'dark';

/** Sets data-theme on <html> and remembers the choice. Both icons render; CSS shows the right one, so there is no hydration mismatch. */
export function ThemeToggle({ className, children }: { className?: string; children?: React.ReactNode } = {}) {
  const [theme, setTheme] = useState<Theme>('light');
  useEffect(() => {
    setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
  }, []);
  function flip(e: React.MouseEvent<HTMLButtonElement>) {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    const apply = () => {
      setTheme(next);
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('mudra-theme', next); } catch { /* storage may be blocked; the choice still applies for this visit */ }
    };
    const root = document.documentElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const vt = (document as Document & { startViewTransition?: (cb: () => void) => unknown }).startViewTransition;
    if (reduce || !vt) { apply(); return; }
    // The new theme spreads outward from the button like a lamp being lit.
    const r = e.currentTarget.getBoundingClientRect();
    root.style.setProperty('--vx', `${Math.round(r.left + r.width / 2)}px`);
    root.style.setProperty('--vy', `${Math.round(r.top + r.height / 2)}px`);
    vt.call(document, apply);
  }
  return (
    <button
      type="button"
      className={className ?? "icon-btn theme-toggle"}
      onClick={flip}
      aria-pressed={theme === 'dark'}
      aria-label="Dark theme"
      title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {children ?? (
        <>
          <Icon name="moon" className="ico-moon" size={20} />
          <Icon name="sun" className="ico-sun" size={20} />
        </>
      )}
    </button>
  );
}
