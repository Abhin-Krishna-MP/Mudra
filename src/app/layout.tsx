import './globals.css';
import './home-upgrade.css';
import './hero-3d.css';
import './home-premium.css';
import './home-premium-plus.css';
import './hero-float.css';
import './top-section.css';
import './hero-kerala.css';
import './explore-dark.css';
import './footer-dark.css';
import './kerala-backdrop.css';
import '@fontsource-variable/playfair-display';
import '@fontsource-variable/playfair-display/wght-italic.css';
import '@fontsource-variable/inter';
import '@fontsource/noto-serif-malayalam';
import '@fontsource/noto-serif-malayalam/700.css';
import { PadippuraNavbar } from '@/components/PadippuraNavbar';
import type { Metadata, Viewport } from 'next';
import { SITE_NAME } from '@/lib/copy';
import { SiteFooter } from '@/components/SiteFooter';
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
        <SiteFooter />
        <Motion />
        <script dangerouslySetInnerHTML={{ __html: THEME_WARM }} />
      </body>
    </html>
  );
}
