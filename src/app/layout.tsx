import './globals.css';
import '@fontsource-variable/playfair-display';
import '@fontsource-variable/playfair-display/wght-italic.css';
import '@fontsource-variable/inter';
import type { Metadata, Viewport } from 'next';
import { SITE_NAME, TAGLINE, DISCLAIMER, NOT_FINANCIAL } from '@/lib/copy';
import { LotusMark, Waves } from '@/components/Ornaments';
import { Icon } from '@/components/Icons';
import { NavLinks } from '@/components/NavLinks';
import { MobileChrome } from '@/components/MobileChrome';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Motion } from '@/components/Motion';

export const metadata: Metadata = {
  title: { default: `${SITE_NAME}`, template: `%s · Mudra` },
  description: 'Look up a cultural work, see who it comes from, and know what the creators and the licence say you may do with it, before you reuse it.',
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: [{ media: '(prefers-color-scheme: light)', color: '#0c3d33' }, { media: '(prefers-color-scheme: dark)', color: '#0a0607' }] };

/** Runs before first paint so the saved (or system) theme is applied with no flash. */
const THEME_BOOT = `try{var t=localStorage.getItem('mudra-theme');if(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)t='dark';if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t)}catch(e){}try{if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('motion')}catch(e){}`;

function Brand() {
  return (
    <a className="brand" href="/" aria-label={`Mudra, ${TAGLINE}. Home`}>
      <LotusMark size={46} />
      <span className="brand-text"><span className="brand-name">Mudra</span><span className="brand-tag">{TAGLINE}</span></span>
    </a>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} /></head>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <Motion />
        <div className="scroll-bar" aria-hidden="true" />
        <header className="site-header">
          <div className="wrap">
            <Brand />
            <NavLinks />
            <div className="head-actions">
              <a className="icon-btn hide-sm" href="/catalogue#search" aria-label="Search the catalogue"><Icon name="search" size={21} /></a>
              <ThemeToggle />
              <a className="icon-btn avatar hide-sm" href="/review" aria-label="Reviewer sign-in"><Icon name="user" size={20} /></a>
              <MobileChrome />
            </div>
          </div>
          <div className="kasavu" aria-hidden="true" />
        </header>
        <main id="main">{children}</main>
        <footer className="site-footer">
          <div className="wrap">
            <div className="kasavu kasavu-foot" aria-hidden="true" />
            <Waves className="wave" />
            <div className="foot">
              <div>
                <Brand />
                <p>{DISCLAIMER}</p>
                <p>{NOT_FINANCIAL}</p>
              </div>
              <nav aria-label="Footer">
                <ul>
                  <li><a href="/catalogue">Catalogue</a></li>
                  <li><a href="/reuse">Reuse Studio</a></li>
                  <li><a href="/verify">Verify a record</a></li>
                  <li><a href="/check">Check an image</a></li>
                  <li><a href="/submit">Submit a work</a></li>
                  <li><a href="/review">Reviewers</a></li>
                  <li><a href="/about">About &amp; limits</a></li>
                </ul>
              </nav>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
