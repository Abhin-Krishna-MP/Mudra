'use client';
import { usePathname } from 'next/navigation';
import { Icon } from './Icons';

export const MAIN_NAV = [
  { href: '/', label: 'Home', match: (p: string) => p === '/' },
  { href: '/catalogue', label: 'Catalogue', hasChevron: true, hasTrailingDivider: true, match: (p: string) => p.startsWith('/catalogue') || p.startsWith('/r/') },
  { href: '/reuse', label: 'Reuse Studio', hasTrailingDivider: true, match: (p: string) => p.startsWith('/reuse') },
  { href: '/about', label: 'About', hasTrailingDivider: true, match: (p: string) => p.startsWith('/about') },
] as const;

export function NavLinks() {
  const path = usePathname() || '/';
  return (
    <nav className="main-nav" aria-label="Main">
      {MAIN_NAV.map((n) => {
        const isCurrent = n.match(path);
        return (
          <div key={n.href} className="nav-item-wrapper">
            <a
              href={n.href}
              className={`nav-item${isCurrent ? ' nav-item-active' : ''}`}
              aria-current={isCurrent ? 'page' : undefined}
            >
              <span className="nav-item-label">{n.label}</span>
              {'hasChevron' in n && n.hasChevron && (
                <span className="nav-caret" aria-hidden="true">
                  <Icon name="chevDown" size={13} />
                </span>
              )}
              {isCurrent && n.label === 'Home' && (
                <span className="home-lotus-finial" aria-hidden="true" />
              )}
            </a>
            {'hasTrailingDivider' in n && n.hasTrailingDivider && (
              <span className="nav-item-sep hide-sm" aria-hidden="true" />
            )}
          </div>
        );
      })}
    </nav>
  );
}
