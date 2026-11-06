'use client';

import React from 'react';
import { Icon } from './Icons';
import { HeroMotion } from './HeroMotion';

export interface TopSectionDarkProps {
  includeCurtain?: boolean;
  scrollCueHref?: string;
}

/**
 * TopSectionDark — Dual-Theme Top Section for Mudra Landing Page
 *
 * - In Light Theme:
 *   Displays the traditional Kathakali 3D stage with floating kasavu silk cloth,
 *   ivory lagoon backdrop, warm oil lamp glow, and golden catalogue CTA buttons.
 *
 * - In Dark Theme:
 *   Displays the redesigned 3D Panchuruli Theyyam stage with temple night plate,
 *   flickering windows, smooth torchlight tracking, dynamic ember particle canvas,
 *   and identical content/CTA buttons matching the light theme for flawless visual harmony.
 *
 * Switching between themes is instant, seamless, and completely glitch-free.
 */
export function TopSectionDark({
  includeCurtain = true,
  scrollCueHref = '#quick-links',
}: TopSectionDarkProps) {
  return (
    <div className="top-section-container">
      {/* 1. Full-screen stage curtain: parts on load with glowing Malayalam calligraphy */}
      {includeCurtain && (
        <div className="stage-curtain" aria-hidden="true">
          <div className="cur-panel cur-l" />
          <div className="cur-panel cur-r" />
          <div className="cur-mark">
            <span className="cur-word" lang="ml">മുദ്ര</span>
            <span className="cur-rule">
              <i />
              <b />
              <i />
            </span>
            <span className="cur-sub">Credit the Culture</span>
          </div>
        </div>
      )}

      {/* ===================================================================
          2. LIGHT THEME HERO (Kathakali, Ivory Silk, Floating Kasavu Gold)
          Shown only when: :root:not([data-theme='dark'])
          =================================================================== */}
      <section className="hero hero-light lt-hero" aria-labelledby="hero-lt-h" suppressHydrationWarning>
        <div className="hero-stage" aria-hidden="true" suppressHydrationWarning>
          <div className="stage-3d" suppressHydrationWarning>
            <img className="layer l-bg lt" src="/mudra/hero-bg.webp" alt="" fetchPriority="high" decoding="async" />
            <img className="layer l-bg l-lamp lt" src="/mudra/hero-lamp-glow.webp" alt="" decoding="async" />
            <div className="mist" />
            <img className="layer l-fig l-under lt" src="/mudra/hero-figure.webp" alt="" decoding="async" />
            <img className="layer l-fig lt" src="/mudra/hero-figure-top.webp" alt="" fetchPriority="high" decoding="async" />
            <img className="layer l-cloth lt" src="/mudra/hero-cloth.webp" alt="" fetchPriority="high" decoding="async" />
            <div className="cloth-sheen lt" />
            <div className="cloth-glow lt" />
          </div>
        </div>
        <div className="hero-bg" aria-hidden="true" />
        <div className="wrap hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">Kerala’s Living Heritage</p>
            <h1 id="hero-lt-h">
              <span className="w" style={{ '--i': 0 } as React.CSSProperties}>Discover</span>
              <span className="dot" aria-hidden="true"> · </span>
              <span className="sr">, </span>
              <span className="w" style={{ '--i': 1 } as React.CSSProperties}>Credit</span>
              <span className="dot" aria-hidden="true"> · </span>
              <span className="sr">, </span>
              <span className="w" style={{ '--i': 2 } as React.CSSProperties}>Reuse</span>{' '}
              <em className="w" style={{ '--i': 3 } as React.CSSProperties}>Responsibly</em>
            </h1>
            <p className="lede">
              A digital space to explore Kerala’s art, craft and cultural expressions, see who they come from, and know how you may reuse them with the creators’ terms.
            </p>
            <div className="cta">
              <a className="btn gold btn-explore" href="/catalogue">
                <span className="btn-seal" aria-hidden="true" />
                <Icon name="book" size={19} />
                <span>Explore Catalogue</span>
                <Icon name="arrow" size={17} />
              </a>
              <a className="btn ghost btn-reuse" href="/reuse">
                <Icon name="layers" size={20} />
                <span>Reuse Studio</span>
                <Icon name="arrow" size={17} />
              </a>
            </div>
          </div>
        </div>
        <a className="scroll-cue" href={scrollCueHref} aria-label="Scroll to explore">
          <span>Scroll</span>
          <i />
        </a>
      </section>

      {/* ===================================================================
          3. DARK THEME HERO (Redesigned Theyyam, Temple Night, Embers, Torch)
          Shown only when: :root[data-theme='dark']
          Contents inside match the light theme perfectly.
          =================================================================== */}
      <section className="hero mx-hero dk-hero" id="mx-home" aria-labelledby="hero-dk-h" suppressHydrationWarning>
        <div className="mx-stage" aria-hidden="true">
          {/* Temple night back-plate with flickering oil lamp window glows */}
          <div className="mx-l mx-l-bg">
            <img src="/mudra/bg-temple.webp" alt="" width={1672} height={941} fetchPriority="high" decoding="async" />
            <i className="mx-win a" />
            <i className="mx-win b" />
            <i className="mx-win c" />
          </div>

          {/* Drifting warm atmospheric mist */}
          <div className="mx-mist" />

          {/* Top-right foliage */}
          <div className="mx-l mx-l-leaf-tr">
            <img src="/mudra/leaves-tr.webp" alt="" width={372} height={200} decoding="async" />
          </div>

          {/* Ember sparks particle canvas */}
          <canvas className="mx-embers" id="mx-embers" />

          {/* Ambient torchlight pool across stage */}
          <div className="mx-torch-ambient" id="mx-stage-torch" />

          {/* Cutout Theyyam figure plate with smooth hardware-accelerated torchlight */}
          <div className="mx-l mx-l-fig" id="mx-fig">
            <div className="mx-fig">
              <img src="/mudra/theyyam.webp" alt="" width={1380} height={1140} fetchPriority="high" decoding="async" />
              <div className="mx-torch-glow" aria-hidden="true" />
            </div>
          </div>

          {/* Floating gold kasavu ribbon */}
          <div className="mx-l mx-l-rib">
            <img className="mx-rib" src="/mudra/ribbon.webp" alt="" width={2172} height={724} decoding="async" />
          </div>

          {/* Top-left foliage */}
          <div className="mx-l mx-l-leaf-tl">
            <img src="/mudra/leaves-tl.webp" alt="" width={520} height={320} decoding="async" />
          </div>

          {/* Depth veil */}
          <div className="mx-veil" />
        </div>

        {/* Hero copy and action buttons — IDENTICAL structure & content as light theme */}
        <div className="wrap hero-inner mx-hero-inner">
          <div className="hero-copy mx-hero-copy">
            <p className="eyebrow">Kerala’s Living Heritage</p>
            <h1 id="hero-dk-h">
              <span className="w" style={{ '--i': 0 } as React.CSSProperties}>Discover</span>
              <span className="dot" aria-hidden="true"> · </span>
              <span className="sr">, </span>
              <span className="w" style={{ '--i': 1 } as React.CSSProperties}>Credit</span>
              <span className="dot" aria-hidden="true"> · </span>
              <span className="sr">, </span>
              <span className="w" style={{ '--i': 2 } as React.CSSProperties}>Reuse</span>{' '}
              <em className="w" style={{ '--i': 3 } as React.CSSProperties}>Responsibly</em>
            </h1>
            <p className="lede">
              A digital space to explore Kerala’s art, craft and cultural expressions, see who they come from, and know how you may reuse them with the creators’ terms.
            </p>
            <div className="cta">
              <a className="btn gold btn-explore" href="/catalogue">
                <span className="btn-seal" aria-hidden="true" />
                <Icon name="book" size={19} />
                <span>Explore Catalogue</span>
                <Icon name="arrow" size={17} />
              </a>
              <a className="btn ghost btn-reuse" href="/reuse">
                <Icon name="layers" size={20} />
                <span>Reuse Studio</span>
                <Icon name="arrow" size={17} />
              </a>
            </div>
          </div>
        </div>

        {/* Interactive parallax, torchlight and ember physics */}
        <HeroMotion />

        {/* Scroll indicator pointing to the content below */}
        <a className="scroll-cue" href={scrollCueHref} aria-label="Scroll to explore">
          <span>Scroll</span>
          <i />
        </a>
      </section>
    </div>
  );
}

export default TopSectionDark;
