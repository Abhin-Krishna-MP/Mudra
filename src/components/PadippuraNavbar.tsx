'use client';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { MobileChrome } from './MobileChrome';
import { LotusMark } from './Ornaments';
import { TAGLINE } from '@/lib/copy';

export function PadippuraNavbar() {
  const path = usePathname() || '/';

  return (
    <header className="site-header padippura-header">
      {/* Desktop & Tablet: User's Exact Kerala Padippura Master Navbar */}
      <div className="padippura-desktop-stage" aria-label="Main Navigation">
        <picture className="padippura-art-wrap">
          <source srcSet="/mudra/navbar-full.webp" type="image/webp" />
          <img
            src="/mudra/navbar-full.png"
            alt="Mudra: Kerala's Living Heritage Registry"
            className="padippura-master-art"
            width={1600}
            height={326}
            fetchPriority="high"
          />
        </picture>

        {/* Hotspots mapped with pixel-perfect precision */}
        <nav className="padippura-hotspots" aria-label="Primary Navigation">
          {/* 1. Brand: Lotus + Mudra + Credit the Culture */}
          <a
            href="/"
            className="padippura-hotspot spot-brand"
            aria-label="Mudra, Credit the Culture. Home"
          />

          {/* 2. Home badge */}
          <a
            href="/"
            className={`padippura-hotspot spot-home${path === '/' ? ' is-active' : ''}`}
            aria-label="Home"
            aria-current={path === '/' ? 'page' : undefined}
          />

          {/* 3. Catalogue */}
          <a
            href="/catalogue"
            className={`padippura-hotspot spot-catalogue${path.startsWith('/catalogue') || path.startsWith('/r/') ? ' is-active' : ''}`}
            aria-label="Catalogue"
            aria-current={path.startsWith('/catalogue') || path.startsWith('/r/') ? 'page' : undefined}
          />

          {/* 4. Reuse Studio */}
          <a
            href="/reuse"
            className={`padippura-hotspot spot-reuse${path.startsWith('/reuse') ? ' is-active' : ''}`}
            aria-label="Reuse Studio"
            aria-current={path.startsWith('/reuse') ? 'page' : undefined}
          />

          {/* 5. About */}
          <a
            href="/about"
            className={`padippura-hotspot spot-about${path.startsWith('/about') ? ' is-active' : ''}`}
            aria-label="About"
            aria-current={path.startsWith('/about') ? 'page' : undefined}
          />

          {/* 6. Search */}
          <a
            href="/catalogue#search"
            className="padippura-hotspot spot-search"
            aria-label="Search the catalogue"
          />

          {/* 7. Theme Toggle */}
          <ThemeToggle className="padippura-hotspot spot-theme">
            <span className="sr-only">Toggle theme</span>
          </ThemeToggle>

          {/* 8. Notification Bell */}
          <button
            type="button"
            className="padippura-hotspot spot-bell"
            aria-label="Notifications: 1 new update"
            onClick={() => alert('Mudra Notification: 1 cultural work recently verified by community elders.')}
          >
            <span className="sr-only">Notifications</span>
          </button>

          {/* 9. Reviewer Avatar */}
          <a
            href="/review"
            className="padippura-hotspot spot-avatar"
            aria-label="Reviewer sign-in"
          />
        </nav>
      </div>

      {/* Mobile Compact Header (< 820px) */}
      <div className="padippura-mobile-bar wrap">
        <a className="brand" href="/" aria-label={`Mudra, ${TAGLINE}. Home`}>
          <LotusMark size={34} />
          <span className="brand-text">
            <span className="brand-name">Mudra</span>
            <span className="brand-tag">{TAGLINE}</span>
          </span>
        </a>
        <div className="mobile-actions">
          <ThemeToggle />
          <MobileChrome />
        </div>
      </div>
    </header>
  );
}
