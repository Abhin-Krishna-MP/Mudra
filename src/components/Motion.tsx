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
    // ---- lamp position: map the artwork's lamp wick (image coords) through object-fit: cover onto the stage box ----
    const placeLamp = () => {
      const st = document.querySelector<HTMLElement>('.hero .stage-3d'); if (!st) return;
      const w = st.offsetWidth, h = st.offsetHeight; if (!w || !h) return;
      const sc = Math.max(w / 1672, h / 941); const iw = 1672 * sc, ih = 941 * sc;
      const px = window.matchMedia('(max-width: 899px)').matches ? 0.97 : 0.78;
      st.style.setProperty('--lampx', `${((w - iw) * px + 0.052 * iw).toFixed(1)}px`);
      st.style.setProperty('--lampy', `${(0.594 * ih).toFixed(1)}px`);
      // same point in the parent stage's coordinates (the 3D plane is inset -4%), for the dark vignette's lamp-shaped hole
      const hs = st.parentElement;
      if (hs) { hs.style.setProperty('--lamphx', `${(parseFloat(st.style.getPropertyValue('--lampx')) + st.offsetLeft).toFixed(1)}px`); hs.style.setProperty('--lamphy', `${(0.594 * ih + st.offsetTop).toFixed(1)}px`); }
    };

    let mo: MutationObserver | null = null;
    const initTimer = setTimeout(() => {
      scan();
      mo = new MutationObserver(() => { scan(); placeLamp(); });
      mo.observe(document.body, { childList: true, subtree: true });
      onScroll();
      placeLamp();
    }, 0);

    window.addEventListener('resize', placeLamp, { passive: true });

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
      // depth surfaces: legacy light hero and inner-page headers (redesigned .mx-hero and .mh are independently controlled)
      document.querySelectorAll<HTMLElement>('.hero:not(.mx-hero):not(.mh), .sheet-head.has-depth').forEach((h) => {
        const hr = h.getBoundingClientRect();
        const rowIn = e.clientY >= hr.top && e.clientY <= hr.bottom;
        const inside = rowIn && e.clientX >= hr.left && e.clientX <= hr.right;
        if (rowIn) {
          h.style.setProperty('--mx', (((e.clientX / window.innerWidth) - 0.5) * 2).toFixed(3));
          h.style.setProperty('--my', ((((e.clientY - hr.top) / hr.height) - 0.5) * 2).toFixed(3));
        }
        h.classList.toggle('is-over', inside);
        if (!h.classList.contains('hero')) return;
        // light: silk glow follows the pointer (position as % of the art plate)
        const cg = h.querySelector<HTMLElement>('.cloth-glow');
        if (cg && cg.offsetParent !== null && inside) {
          const r = cg.getBoundingClientRect();
          if (r.width > 0) { h.style.setProperty('--cgx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`); h.style.setProperty('--cgy', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`); }
        }
        // dark: the lamp flares as the pointer approaches (0 far .. 1 on top of it)
        const spot = h.querySelector<HTMLElement>('.lamp-spot');
        if (spot && spot.offsetParent !== null) {
          let v = 0;
          if (inside) { const s = spot.getBoundingClientRect(); const t = Math.max(0, 1 - Math.hypot(e.clientX - s.left, e.clientY - s.top) / 380); v = t * t * (3 - 2 * t); }
          h.style.setProperty('--lamp', v.toFixed(3));
        }
      });
      // hero buttons lean toward the pointer, then spring back
      document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((b) => {
        const r = b.getBoundingClientRect(); if (r.width === 0) return;
        const dx = e.clientX - (r.left + r.width / 2); const dy = e.clientY - (r.top + r.height / 2);
        const reach = Math.max(r.width, r.height) / 2 + 96;
        if (Math.hypot(dx, dy) < reach) {
          const c = (v: number, m: number) => Math.max(-m, Math.min(m, v));
          b.classList.add('mag-on');
          b.style.setProperty('--tx', `${c(dx * 0.2, 11).toFixed(1)}px`); b.style.setProperty('--ty', `${c(dy * 0.32, 8).toFixed(1)}px`);
        } else if (b.classList.contains('mag-on')) { b.classList.remove('mag-on'); b.style.removeProperty('--tx'); b.style.removeProperty('--ty'); }
      });
    };
    const onMove = (e: PointerEvent) => { if (e.pointerType !== 'mouse') return; last = e; if (!raf) raf = requestAnimationFrame(frame); };
    const onLeave = () => {
      reset(current); current = null;
      document.querySelectorAll<HTMLElement>('.hero:not(.mx-hero):not(.mh), .sheet-head.has-depth').forEach((h) => { h.classList.remove('is-over'); h.style.setProperty('--lamp', '0'); });
      document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((b) => { b.classList.remove('mag-on'); b.style.removeProperty('--tx'); b.style.removeProperty('--ty'); });
    };
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
        document.querySelector<HTMLElement>('.hero:not(.mx-hero):not(.mh)')?.style.setProperty('--sy', String(Math.min(window.scrollY, 900)));
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      clearTimeout(initTimer);
      io?.disconnect(); mo?.disconnect();
      document.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', placeLamp);
      if (raf) cancelAnimationFrame(raf); if (sraf) cancelAnimationFrame(sraf);
      root.classList.remove('motion');
    };
  }, []);
  return null;
}
