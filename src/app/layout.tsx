import './globals.css';
import './home-upgrade.css';
import './hero-3d.css';
import './home-premium.css';
import './home-premium-plus.css';
import './hero-float.css';
import './top-section.css';
import './hero-kerala.css';
import '@fontsource-variable/playfair-display';
import '@fontsource-variable/playfair-display/wght-italic.css';
import '@fontsource-variable/inter';
import '@fontsource/noto-serif-malayalam';
import '@fontsource/noto-serif-malayalam/700.css';
import { PadippuraNavbar } from '@/components/PadippuraNavbar';
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

/** After first paint, decode the hidden theme's hero art in idle time so the theme switch never waits on image decoding. */
const THEME_WARM = `(function(){function w(){try{document.querySelectorAll('.hero-stage img, .mx-stage img').forEach(function(i){if(i.decode)i.decode().catch(function(){})})}catch(e){}}if('requestIdleCallback' in window)requestIdleCallback(w,{timeout:2500});else setTimeout(w,1500)})()`;

function Brand() {
  return (
    <a className="brand" href="/" aria-label={`Mudra, ${TAGLINE}. Home`}>
      <LotusMark size={38} />
      <span className="brand-text">
        <span className="brand-name">Mudra</span>
        <span className="brand-tag">CREDIT THE CULTURE</span>
      </span>
    </a>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
        {/* Preload hero images and navbar master artwork to eliminate first-paint lag */}
        <link rel="preload" as="image" href="/mudra/navbar-full.webp" fetchPriority="high" />
        <link rel="preload" as="image" href="/mudra/kathakali.webp" fetchPriority="high" />
        <link rel="preload" as="image" href="/mudra/plants-cloth.webp" fetchPriority="high" />
        <link rel="preload" as="image" href="/mudra/bg-temple.webp" fetchPriority="high" />
        <link rel="preload" as="image" href="/mudra/theyyam.webp" fetchPriority="high" />
        <link rel="preload" as="image" href="/mudra/ribbon.webp" />
      </head>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <div className="scroll-bar" aria-hidden="true" />
        <PadippuraNavbar />
        <main id="main">{children}</main>
        <footer className="site-footer">
          <div className="foot-brand-row">
            <div className="wrap foot-brand-inner">
              <LotusMark size={56} />
              <div className="foot-headline">
                <span className="foot-brand-name">Mudra</span>
                <span className="foot-brand-tag">{TAGLINE}</span>
              </div>
            </div>
          </div>
          <div className="wrap">
            <div className="kasavu kasavu-foot" aria-hidden="true" />
            <Waves className="wave" />
            <div className="foot">
              <div className="foot-col foot-col-about">
                <Brand />
                <p>{DISCLAIMER}</p>
                <p>{NOT_FINANCIAL}</p>
              </div>
              <nav aria-label="Explore" className="foot-col">
                <p className="foot-nav-head">Explore</p>
                <ul>
                  <li><a href="/catalogue">Cultural Passport</a></li>
                  <li><a href="/reuse">Reuse Studio</a></li>
                </ul>
              </nav>
              <nav aria-label="Tools" className="foot-col">
                <p className="foot-nav-head">Tools</p>
                <ul>
                  <li><a href="/verify">Verify a record</a></li>
                  <li><a href="/check">Check an image</a></li>
                  <li><a href="/submit">Submit a work</a></li>
                </ul>
              </nav>
              <nav aria-label="About" className="foot-col">
                <p className="foot-nav-head">About</p>
                <ul>
                  <li><a href="/review">Reviewers</a></li>
                  <li><a href="/about">About &amp; limits</a></li>
                </ul>
              </nav>
            </div>
            <div className="foot-legal">
              <span>© 2026 Mudra Project · Kerala Cultural Heritage Registry</span>
              <span className="foot-legal-sep" aria-hidden="true">·</span>
              <span>Preserving living traditions for future generations</span>
            </div>
          </div>
        </footer>
        <Motion />
        <script dangerouslySetInnerHTML={{ __html: THEME_WARM }} />
      </body>
    </html>
  );
}
