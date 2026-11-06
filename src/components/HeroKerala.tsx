'use client';

import { useEffect } from 'react';

export function HeroKerala() {
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>('.hero.lt-hero.mh');
    if (!hero) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Generate floating golden motes
    const box = hero.querySelector<HTMLElement>('.l-motes');
    if (box && !reduce && box.children.length === 0) {
      for (let i = 0; i < 26; i++) {
        const m = document.createElement('i');
        const s = (2 + Math.random() * 4).toFixed(1);
        const d = (9 + Math.random() * 10).toFixed(1);
        const dl = (-Math.random() * 14).toFixed(1);
        const x = ((Math.random() - 0.5) * 160).toFixed(0);
        m.style.cssText = `left:${(Math.random() * 100).toFixed(1)}%;--s:${s}px;--d:${d}s;--dl:${dl}s;--x:${x}px;`;
        box.appendChild(m);
      }
    }

    if (reduce) return;

    let mx = 0;
    let my = 0;
    let tx = 0;
    let ty = 0;
    let sy = 0;
    let ts = 0;
    let gx = 60;
    let gy = 75;
    let tgx = 60;
    let tgy = 75;
    let last = 0;
    let isVisible = true;
    let isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    let rafId: number | null = null;

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      if (document.documentElement.getAttribute('data-theme') === 'dark') return;
      const r = hero.getBoundingClientRect();
      // Track pointer across viewport as long as hero is in view
      if (r.bottom < 0 || r.top > window.innerHeight) return;

      // Mouse offset normalized around hero center (-1 to 1)
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      tx = Math.max(-1.4, Math.min(1.4, (e.clientX - cx) / (r.width / 2)));
      ty = Math.max(-1.4, Math.min(1.4, (e.clientY - cy) / (r.height / 2)));

      tgx = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
      tgy = Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100));
      last = performance.now();
      hero.classList.add('is-over');
    };

    const onPointerLeave = () => {
      hero.classList.remove('is-over');
      tx = 0;
      ty = 0;
    };

    const onScroll = () => {
      ts = Math.min(window.scrollY, 900);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('mouseleave', onPointerLeave);
    window.addEventListener('scroll', onScroll, { passive: true });

    // Magnetic tilt on buttons
    const buttons = hero.querySelectorAll<HTMLElement>('.btn, .mh-btn');
    const onBtnMove = (e: MouseEvent) => {
      const btn = e.currentTarget as HTMLElement;
      const r = btn.getBoundingClientRect();
      const ox = ((e.clientX - r.left - r.width / 2) * 0.15).toFixed(1);
      const oy = ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1);
      btn.style.transform = `translate3d(${ox}px, ${oy}px, 0)`;
    };
    const onBtnLeave = (e: MouseEvent) => {
      const btn = e.currentTarget as HTMLElement;
      btn.style.transform = '';
    };

    buttons.forEach((btn) => {
      btn.addEventListener('mousemove', onBtnMove);
      btn.addEventListener('mouseleave', onBtnLeave);
    });

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible && !isDark && !rafId) {
        rafId = requestAnimationFrame(loop);
      }
    });
    observer.observe(hero);

    const themeObserver = new MutationObserver(() => {
      isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (!isDark && isVisible && !rafId) {
        rafId = requestAnimationFrame(loop);
      }
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const loop = (t: number) => {
      if (!isVisible || isDark) {
        rafId = null;
        return;
      }
      const idle = t - last > 1800;
      const a = idle ? Math.sin(t / 2200) * 0.5 : tx;
      const b = idle ? Math.cos(t / 2800) * 0.38 : ty;

      mx += (a - mx) * 0.08;
      my += (b - my) * 0.08;
      sy += (ts - sy) * 0.1;
      gx += (tgx - gx) * 0.1;
      gy += (tgy - gy) * 0.1;

      hero.style.setProperty('--mx', mx.toFixed(3));
      hero.style.setProperty('--my', my.toFixed(3));
      hero.style.setProperty('--sy', sy.toFixed(1));
      hero.style.setProperty('--cgx', `${gx.toFixed(1)}%`);
      hero.style.setProperty('--cgy', `${gy.toFixed(1)}%`);

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
      themeObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('mouseleave', onPointerLeave);
      window.removeEventListener('scroll', onScroll);
      buttons.forEach((btn) => {
        btn.removeEventListener('mousemove', onBtnMove);
        btn.removeEventListener('mouseleave', onBtnLeave);
      });
    };
  }, []);

  return null;
}
