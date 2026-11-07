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
    let ksy = 0;
    let tks = 0;
    let gx = 60;
    let gy = 75;
    let tgx = 60;
    let tgy = 75;
    let last = 0;
    let isVisible = true;
    let isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    let rafId: number | null = null;

    // String caches to eliminate redundant DOM style recalculations and heat
    let prevMx = '', prevMy = '', prevKsy = '', prevCgx = '', prevCgy = '';
    let prevEx = '', prevEy = '';

    const fig = hero.querySelector<HTMLElement>('.l-fig');
    const eyes = hero.querySelectorAll<HTMLElement>('.eye');
    let egx = 0;
    let egy = 0;

    const startLoop = () => {
      if (!rafId && isVisible && !isDark && !document.hidden) {
        rafId = requestAnimationFrame(loop);
      }
    };

    const stopLoop = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

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
      startLoop();
    };

    const onPointerLeave = () => {
      hero.classList.remove('is-over');
      tx = 0;
      ty = 0;
      startLoop();
    };

    const onScroll = () => {
      tks = Math.min(window.scrollY, 900);
      startLoop();
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
      if (isVisible && !isDark && !document.hidden) {
        startLoop();
      } else {
        stopLoop();
      }
    });
    observer.observe(hero);

    const themeObserver = new MutationObserver(() => {
      isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (!isDark && isVisible && !document.hidden) {
        startLoop();
      } else {
        stopLoop();
      }
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // Pause animation completely when user switches tabs or minimizes browser
    const onVisibilityChange = () => {
      if (document.hidden) {
        stopLoop();
      } else if (isVisible && !isDark) {
        startLoop();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const loop = (t: number) => {
      if (!isVisible || isDark || document.hidden) {
        rafId = null;
        return;
      }
      const idle = t - last > 1800;
      const a = idle ? Math.sin(t / 2200) * 0.45 : tx;
      const b = idle ? Math.cos(t / 2800) * 0.32 : ty;

      mx += (a - mx) * 0.08;
      my += (b - my) * 0.08;
      ksy += (tks - ksy) * 0.18;
      gx += (tgx - gx) * 0.1;
      gy += (tgy - gy) * 0.1;

      /* Kathakali eyes: follow pointer; when idle, glance around and roll every few seconds */
      let tgx2 = tx;
      let tgy2 = ty;
      if (idle) {
        const q = (t % 7000) / 7000;
        if (q < 0.25) {
          const a2 = (q / 0.25) * Math.PI * 2;
          tgx2 = Math.cos(a2);
          tgy2 = Math.sin(a2) * 0.6;
        } else {
          tgx2 = Math.sin(t / 1700) * 0.6;
          tgy2 = Math.cos(t / 2300) * 0.25;
        }
      }
      egx += (tgx2 - egx) * 0.12;
      egy += (tgy2 - egy) * 0.12;

      if (fig) {
        const k = (fig.clientWidth / 1303) * 8;
        const exStr = (egx * k).toFixed(2);
        const eyStr = (egy * k * 0.7).toFixed(2);
        if (exStr !== prevEx || eyStr !== prevEy) {
          eyes.forEach((eye) => {
            eye.style.setProperty('--ex', exStr);
            eye.style.setProperty('--ey', eyStr);
          });
          prevEx = exStr;
          prevEy = eyStr;
        }
      }

      const mxStr = mx.toFixed(3);
      const myStr = my.toFixed(3);
      const ksyStr = ksy.toFixed(1);
      const cgxStr = `${gx.toFixed(1)}%`;
      const cgyStr = `${gy.toFixed(1)}%`;

      if (mxStr !== prevMx || myStr !== prevMy || ksyStr !== prevKsy || cgxStr !== prevCgx || cgyStr !== prevCgy) {
        hero.style.setProperty('--mx', mxStr);
        hero.style.setProperty('--my', myStr);
        hero.style.setProperty('--ksy', ksyStr);
        hero.style.setProperty('--cgx', cgxStr);
        hero.style.setProperty('--cgy', cgyStr);
        prevMx = mxStr; prevMy = myStr; prevKsy = ksyStr; prevCgx = cgxStr; prevCgy = cgyStr;
      }

      rafId = requestAnimationFrame(loop);
    };

    startLoop();

    return () => {
      stopLoop();
      observer.disconnect();
      themeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
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
