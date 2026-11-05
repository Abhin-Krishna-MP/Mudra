'use client';
import { useEffect } from 'react';

/**
 * Site-wide motion controller. One component, event delegation, no libraries.
 *  - [data-reveal]  fades/rises into view (IntersectionObserver)
 *  - [data-tilt]    3D tilt + glare + depth parallax that follows a mouse pointer
 *  - .hero          pointer + scroll parallax (CSS variables --mx --my --sy)
 *  - :root          --scroll (0..1) drives the gold reading-progress bar
 * Everything is skipped when the visitor prefers reduced motion, and the page is fully usable without it.
 */
export function Motion() {
  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;
    root.classList.add('motion');

    // ---- reveal on scroll ----
    const io = 'IntersectionObserver' in window
      ? new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io?.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' })
      : null;
    const seen = new WeakSet<Element>();
    const scan = () => document.querySelectorAll('[data-reveal]').forEach((el) => {
      if (seen.has(el)) return; seen.add(el);
      if (io) io.observe(el); else el.classList.add('is-in');
    });
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    // ---- pointer: tilt + hero parallax ----
    let current: HTMLElement | null = null;
    let last: PointerEvent | null = null; let raf = 0;
    const reset = (el: HTMLElement | null) => { if (!el) return; el.classList.remove('tilting'); ['--rx', '--ry', '--gx', '--gy', '--px', '--py'].forEach((v) => el.style.removeProperty(v)); };
    const frame = () => {
      raf = 0; const e = last; if (!e) return;
      const t = (e.target as Element | null)?.closest?.('[data-tilt]') as HTMLElement | null;
      if (current && current !== t) { reset(current); current = null; }
      if (t) {
        const r = t.getBoundingClientRect();
        const px = Math.max(-0.5, Math.min(0.5, (e.clientX - r.left) / r.width - 0.5));
        const py = Math.max(-0.5, Math.min(0.5, (e.clientY - r.top) / r.height - 0.5));
        const k = Number(t.dataset.tilt) || 10;
        t.classList.add('tilting');
        t.style.setProperty('--rx', `${(-py * k).toFixed(2)}deg`);
        t.style.setProperty('--ry', `${(px * k * 1.2).toFixed(2)}deg`);
        t.style.setProperty('--px', px.toFixed(3)); t.style.setProperty('--py', py.toFixed(3));
        t.style.setProperty('--gx', `${((px + 0.5) * 100).toFixed(1)}%`); t.style.setProperty('--gy', `${((py + 0.5) * 100).toFixed(1)}%`);
        current = t;
      }
      const hero = document.querySelector<HTMLElement>('.hero');
      if (hero) {
        const hr = hero.getBoundingClientRect();
        if (e.clientY >= hr.top && e.clientY <= hr.bottom) {
          hero.style.setProperty('--mx', (((e.clientX / window.innerWidth) - 0.5) * 2).toFixed(3));
          hero.style.setProperty('--my', ((((e.clientY - hr.top) / hr.height) - 0.5) * 2).toFixed(3));
        }
      }
    };
    const onMove = (e: PointerEvent) => { if (e.pointerType !== 'mouse') return; last = e; if (!raf) raf = requestAnimationFrame(frame); };
    const onLeave = () => { reset(current); current = null; };
    document.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);

    // ---- scroll: progress bar + hero depth ----
    let sraf = 0;
    const onScroll = () => {
      if (sraf) return;
      sraf = requestAnimationFrame(() => {
        sraf = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        root.style.setProperty('--scroll', max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : '0');
        document.querySelector<HTMLElement>('.hero')?.style.setProperty('--sy', String(Math.min(window.scrollY, 900)));
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      io?.disconnect(); mo.disconnect();
      document.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf); if (sraf) cancelAnimationFrame(sraf);
      root.classList.remove('motion');
    };
  }, []);
  return null;
}
