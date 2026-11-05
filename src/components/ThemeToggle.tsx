'use client';
import { useEffect, useState } from 'react';
import { Icon } from './Icons';

type Theme = 'light' | 'dark';

/** Sets data-theme on <html> and remembers the choice. Both icons render; CSS shows the right one, so there is no hydration mismatch. */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');
  useEffect(() => {
    setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
  }, []);
  function flip() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('mudra-theme', next); } catch { /* storage may be blocked; the choice still applies for this visit */ }
  }
  return (
    <button type="button" className="icon-btn theme-toggle" onClick={flip} aria-pressed={theme === 'dark'} aria-label="Dark theme" title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}>
      <Icon name="moon" className="ico-moon" size={20} />
      <Icon name="sun" className="ico-sun" size={20} />
    </button>
  );
}
