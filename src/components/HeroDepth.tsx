'use client';

import { useEffect } from 'react';

/**
 * HeroDepth — pointer + scroll parallax for the light-theme depth hero.
 * Writes --dx / --dy (pointer, -1..1), --ds (scroll px), --lx / --ly (torch on the
 * Kathakali) and --sx (silk sheen) on the .lt-hero section. Pauses off-screen,
 * idles with a slow drift, and does nothing under prefers-reduced-motion.
 * Uses its own variable names so it never fights Motion.tsx (--mx / --sy).
 */
export function HeroDepth() {
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>('.lt-hero.dh');
    if (!hero) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const themeObserver = new MutationObserver(() => {
      isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const kath = hero.querySelector<HTMLElement>('.d-kath');
    const silk = hero.querySelector<HTMLElement>('.d-kasavu');
    let tx = 0, ty = 0, x = 0, y = 0, sy = 0, csy = 0, last = 0, visible = true, raf = 0;
    let lx = 62, ly = 38, tlx = 62, tly = 38, sx = 50, tsx = 50;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || isDark) return;
      const r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      last = performance.now();
      hero.classList.add('is-over');
      if (kath) {
        const k = kath.getBoundingClientRect();
        tlx = ((e.clientX - k.left) / k.width) * 100;
        tly = ((e.clientY - k.top) / k.height) * 100;
      }
      if (silk) {
        const s = silk.getBoundingClientRect();
        tsx = ((e.clientX - s.left) / s.width) * 100;
        const d = Math.hypot(e.clientX - (s.left + s.width * 0.096), e.clientY - (s.top + s.height * 0.37));
        hero.classList.toggle('is-lamp', d < s.width * 0.12);
      }
    };
    const onLeave = () => { tx = 0; ty = 0; hero.classList.remove('is-over', 'is-lamp'); };
    const onScroll = () => { sy = Math.min(window.scrollY, 900); };

    hero.addEventListener('pointermove', onMove, { passive: true });
    hero.addEventListener('pointerleave', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    const io = 'IntersectionObserver' in window
      ? new IntersectionObserver((en) => { visible = en[0].isIntersecting; })
      : null;
    io?.observe(hero);

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || isDark) return;
      const idle = t - last > 2500;
      const gx = idle ? Math.sin(t / 3200) * 0.3 : tx;
      const gy = idle ? Math.cos(t / 4100) * 0.2 : ty;
      x += (gx - x) * 0.07; y += (gy - y) * 0.07; csy += (sy - csy) * 0.1;
      lx += (tlx - lx) * 0.12; ly += (tly - ly) * 0.12; sx += (tsx - sx) * 0.08;
      const st = hero.style;
      st.setProperty('--dx', x.toFixed(3));
      st.setProperty('--dy', y.toFixed(3));
      st.setProperty('--ds', csy.toFixed(1));
      st.setProperty('--lx', lx.toFixed(1) + '%');
      st.setProperty('--ly', ly.toFixed(1) + '%');
      st.setProperty('--sx', (idle ? 50 + Math.sin(t / 2600) * 40 : sx).toFixed(1) + '%');
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      themeObserver.disconnect();
      io?.disconnect();
      hero.removeEventListener('pointermove', onMove);
      hero.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);
  return null;
}

export default HeroDepth;
