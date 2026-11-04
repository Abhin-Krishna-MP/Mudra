import './globals.css';
import type { Metadata } from 'next';
import { SITE_NAME, TAGLINE, DISCLAIMER } from '@/lib/copy';

export const metadata: Metadata = {
  title: { default: `${SITE_NAME}`, template: `%s · Mudra` },
  description: 'Look up a cultural work, see who it comes from, and know what the creators and the licence say you may do with it, before you reuse it.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <header className="site">
          <div className="wrap">
            <a className="brand" href="/">Mudra<small>{TAGLINE}</small></a>
            <nav className="main" aria-label="Main">
              <a href="/">Catalogue</a>
              <a href="/check">Check an image</a>
              <a href="/submit">Submit a work</a>
              <a href="/review">Reviewers</a>
              <a href="/about">About &amp; limits</a>
            </nav>
          </div>
        </header>
        <main id="main"><div className="wrap">{children}</div></main>
        <footer className="site"><div className="wrap"><p>{DISCLAIMER}</p></div></footer>
      </body>
    </html>
  );
}
