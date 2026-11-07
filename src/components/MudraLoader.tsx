'use client';
import { useEffect, useRef } from 'react';

export function MudraLoader({ once = true }: { once?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const element = el;
    const root = document.documentElement;

    if (once) {
      try {
        if (sessionStorage.getItem('mudraLoaderSeen')) {
          element.classList.add('is-done');
          element.style.display = 'none';
          root.classList.remove('mudra-loading');
          document.dispatchEvent(new Event('mudra:loaded'));
          return;
        }
      } catch (e) {}
    }

    const MIN_MS = 1600;
    const MAX_MS = 6000;
    const fill = element.querySelector<HTMLElement>('.mudra-loader__fill');
    const pct = element.querySelector<HTMLElement>('.mudra-loader__pct');
    const motes = element.querySelector<HTMLElement>('.mudra-loader__motes');

    if (motes && motes.children.length === 0) {
      for (let i = 0; i < 18; i++) {
        const m = document.createElement('i');
        m.style.cssText = `left:${Math.random() * 100}%;--s:${(2 + Math.random() * 4).toFixed(1)}px;--d:${(8 + Math.random() * 8).toFixed(1)}s;--dl:${(-Math.random() * 10).toFixed(1)}s;--x:${((Math.random() - 0.5) * 140).toFixed(0)}px`;
        motes.appendChild(m);
      }
    }

    const start = performance.now();
    let loaded = document.readyState === 'complete';
    let p = 0;
    let done = false;
    let animId: number;

    function set(v: number) {
      p = v;
      element.style.setProperty('--p', (v / 100).toFixed(3));
      if (pct) pct.textContent = Math.round(v) + '%';
      element.setAttribute('aria-valuenow', String(Math.round(v)));
    }

    function finish() {
      if (done) return;
      done = true;
      set(100);
      setTimeout(() => {
        element.classList.add('is-done');
        root.classList.remove('mudra-loading');
        try { sessionStorage.setItem('mudraLoaderSeen', '1'); } catch (e) {}
        document.dispatchEvent(new Event('mudra:loaded'));
        setTimeout(() => {
          element.style.display = 'none';
        }, 1200);
      }, 300);
    }

    function tick() {
      if (done) return;
      const t = performance.now() - start;
      const target = Math.min(loaded ? 100 : 88, (t / MIN_MS) * 100);
      set(p + (target - p) * 0.08);
      if (loaded && t >= MIN_MS && p > 97) finish();
      else if (t > MAX_MS) finish();
      else animId = requestAnimationFrame(tick);
    }

    animId = requestAnimationFrame(tick);

    function onLoad() { loaded = true; }
    if (!loaded) window.addEventListener('load', onLoad, { once: true });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('load', onLoad);
    };
  }, [once]);

  return (
    <div
      ref={ref}
      className="mudra-loader"
      id="mudraLoader"
      role="progressbar"
      aria-label="Loading Mudra"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      data-once={once ? '' : undefined}
    >
      <div className="mudra-loader__motes" aria-hidden="true" />
      <div className="mudra-loader__stage">
        <div className="mudra-loader__halo" aria-hidden="true" />
        <picture>
          <source srcSet="/mudra/lotus-loader.webp" type="image/webp" />
          <img
            className="mudra-loader__logo"
            src="/mudra/lotus-loader.gif"
            alt="Mudra Lotus"
            width={441}
            height={240}
          />
        </picture>
        <h2 className="mudra-loader__name">Mudra</h2>
        <p className="mudra-loader__tag">Credit the Culture</p>
        <div className="mudra-loader__bar" aria-hidden="true">
          <div className="mudra-loader__fill" />
        </div>
        <div className="mudra-loader__pct" aria-hidden="true">0%</div>
      </div>
    </div>
  );
}
