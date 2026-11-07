'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Icon, type IconName } from './Icons';
import { InstallAppButton } from './PwaRegister';

export const TABS: { href: string; label: string; icon: IconName; match: (p: string) => boolean }[] = [
  { href: '/', label: 'Home', icon: 'home', match: (p) => p === '/' },
  { href: '/catalogue', label: 'Catalogue', icon: 'book', match: (p) => p.startsWith('/catalogue') || p.startsWith('/r/') },
  { href: '/reuse', label: 'Reuse', icon: 'layers', match: (p) => p.startsWith('/reuse') },
  { href: '/verify', label: 'Verify', icon: 'shield', match: (p) => p.startsWith('/verify') },
];

export const MORE: { href: string; label: string; icon: IconName }[] = [
  { href: '/check', label: 'Check an image', icon: 'scan' },
  { href: '/submit', label: 'Submit a work', icon: 'upload' },
  { href: '/developers', label: 'For platforms', icon: 'tools' },
  { href: '/about', label: 'About & limits', icon: 'info' },
  { href: '/review', label: 'Reviewers', icon: 'user' },
];

/** Phone-only chrome: a menu button for the header and a five-tab bar. "More" and the menu button open the same sheet. */
export function MobileChrome() {
  const [open, setOpen] = useState(false);
  const path = usePathname() || '/';
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);
  const moreActive = MORE.some((m) => path.startsWith(m.href));
  return (
    <>
      <button type="button" className="icon-btn menu-btn" aria-expanded={open} aria-controls="mobile-sheet" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((o) => !o)}>
        <Icon name={open ? 'close' : 'menu'} size={22} />
      </button>
      <div id="mobile-sheet" className="mobile-sheet" hidden={!open}>
        <nav aria-label="More pages">
          <ul>
            {MORE.map((m) => (
              <li key={m.href}><a href={m.href} aria-current={path.startsWith(m.href) ? 'page' : undefined}><Icon name={m.icon} size={20} />{m.label}</a></li>
            ))}
            <li><InstallAppButton /></li>
          </ul>
        </nav>
      </div>
      <nav className="bottom-nav" aria-label="Primary">
        <ul>
          {TABS.map((t) => (
            <li key={t.href}><a href={t.href} aria-current={t.match(path) ? 'page' : undefined}><Icon name={t.icon} size={22} /><span>{t.label}</span></a></li>
          ))}
          <li><button type="button" className="tab-more" aria-expanded={open} aria-controls="mobile-sheet" aria-current={moreActive ? 'page' : undefined} onClick={() => setOpen((o) => !o)}><Icon name="more" size={22} /><span>More</span></button></li>
        </ul>
      </nav>
    </>
  );
}
