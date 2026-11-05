'use client';
import { usePathname } from 'next/navigation';

export const MAIN_NAV = [
  { href: '/', label: 'Home', match: (p: string) => p === '/' },
  { href: '/catalogue', label: 'Catalogue', match: (p: string) => p.startsWith('/catalogue') || p.startsWith('/r/') },
  { href: '/check', label: 'Check', match: (p: string) => p.startsWith('/check') },
  { href: '/developers', label: 'For platforms', match: (p: string) => p.startsWith('/developers') },
  { href: '/about', label: 'About', match: (p: string) => p.startsWith('/about') },
] as const;

export function NavLinks() {
  const path = usePathname() || '/';
  return (
    <nav className="main-nav" aria-label="Main">
      {MAIN_NAV.map((n) => (
        <a key={n.href} href={n.href} aria-current={n.match(path) ? 'page' : undefined}>{n.label}</a>
      ))}
    </nav>
  );
}
