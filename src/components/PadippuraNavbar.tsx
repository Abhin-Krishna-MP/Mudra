'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { LotusMark } from './Ornaments';
import { Icon } from './Icons';
import { TAGLINE } from '@/lib/copy';
import { TABS, MORE } from './MobileChrome';
import { InstallAppButton } from './PwaRegister';
import { NotificationPopover, useNotifications } from './NotificationPopover';

export function PadippuraNavbar() {
  const path = usePathname() || '/';
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications, unreadCount, markAllAsRead } = useNotifications();

  useEffect(() => { setOpen(false); setNotifOpen(false); }, [path]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const moreActive = MORE.some((m) => path.startsWith(m.href));

  return (
    <>
      <header className="site-header padippura-header">
        {/* Desktop & Tablet: User's Exact Kerala Padippura Master Navbar */}
        <div className="padippura-desktop-stage" aria-label="Main Navigation">
          {/* Light Theme Artwork */}
          <picture className="padippura-art-wrap padippura-art-light">
            <source srcSet="/mudra/navbar-full.webp" type="image/webp" />
            <img
              src="/mudra/navbar-full.png"
              alt="Mudra: Kerala's Living Heritage Registry"
              className="padippura-master-art"
              width={2087}
              height={436}
              fetchPriority="high"
            />
          </picture>

          {/* Dark Theme Artwork */}
          <picture className="padippura-art-wrap padippura-art-dark">
            <source srcSet="/mudra/navbar-dark.webp" type="image/webp" />
            <img
              src="/mudra/navbar-dark.png"
              alt="Mudra: Kerala's Living Heritage Registry"
              className="padippura-master-art"
              width={2087}
              height={436}
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
            >
              <span className="spot-label">Home</span>
            </a>

            {/* 3. Catalogue */}
            <a
              href="/catalogue"
              className={`padippura-hotspot spot-catalogue${path.startsWith('/catalogue') || path.startsWith('/r/') ? ' is-active' : ''}`}
              aria-label="Catalogue"
              aria-current={path.startsWith('/catalogue') || path.startsWith('/r/') ? 'page' : undefined}
            >
              <span className="spot-label">Catalogue<svg className="spot-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg></span>
            </a>

            {/* 4. Reuse Studio */}
            <a
              href="/reuse"
              className={`padippura-hotspot spot-reuse${path.startsWith('/reuse') ? ' is-active' : ''}`}
              aria-label="Reuse Studio"
              aria-current={path.startsWith('/reuse') ? 'page' : undefined}
            >
              <span className="spot-label">Reuse Studio</span>
            </a>

            {/* 5. About */}
            <a
              href="/about"
              className={`padippura-hotspot spot-about${path.startsWith('/about') ? ' is-active' : ''}`}
              aria-label="About"
              aria-current={path.startsWith('/about') ? 'page' : undefined}
            >
              <span className="spot-label">About</span>
            </a>

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
              aria-label={`Notifications: ${unreadCount} new update${unreadCount === 1 ? '' : 's'}`}
              aria-expanded={notifOpen}
              onClick={() => setNotifOpen((o) => !o)}
            >
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
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

        {/* Mobile Compact Header (< 900px) */}
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
            <button
              type="button"
              className="icon-btn notif-mobile-btn"
              aria-label={`Notifications: ${unreadCount} updates`}
              aria-expanded={notifOpen}
              onClick={() => setNotifOpen((o) => !o)}
              style={{ position: 'relative' }}
            >
              <Icon name="bell" size={20} />
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </button>
            <button
              type="button"
              className="icon-btn menu-btn"
              aria-expanded={open}
              aria-controls="mobile-sheet"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((o) => !o)}
            >
              <Icon name={open ? 'close' : 'menu'} size={22} />
            </button>
          </div>

          {/* Dropdown sheet right under the pill */}
          <div id="mobile-sheet" className="mobile-sheet" hidden={!open}>
            <nav aria-label="More pages">
              <ul>
                {MORE.map((m) => (
                  <li key={m.href}>
                    <a href={m.href} aria-current={path.startsWith(m.href) ? 'page' : undefined}>
                      <Icon name={m.icon} size={20} />
                      <span>{m.label}</span>
                    </a>
                  </li>
                ))}
                <li>
                  <InstallAppButton />
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Backdrop for tapping outside the sheet to close */}
      {open && (
        <div
          className="mobile-sheet-backdrop"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Real Live Registry Notifications Popover */}
      <NotificationPopover
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAllAsRead={markAllAsRead}
      />

      {/* Mobile Bottom Tab Bar: completely outside <header> so no containing block or backdrop-filter traps it! */}
      <nav className="bottom-nav" aria-label="Primary">
        <ul>
          {TABS.map((t) => (
            <li key={t.href}>
              <a href={t.href} aria-current={t.match(path) ? 'page' : undefined}>
                <Icon name={t.icon} size={22} />
                <span>{t.label}</span>
              </a>
            </li>
          ))}
          <li>
            <button
              type="button"
              className="tab-more"
              aria-expanded={open}
              aria-controls="mobile-sheet"
              aria-current={moreActive ? 'page' : undefined}
              onClick={() => setOpen((o) => !o)}
            >
              <Icon name={open ? 'close' : 'more'} size={22} />
              <span>More</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
