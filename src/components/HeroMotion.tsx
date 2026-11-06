'use client';
import { useEffect } from 'react';

/**
 * HeroMotion — Controller for the redesigned Dark Theme Theyyam Hero
 * Drives:
 *   --mx / --my    eased pointer parallax (-1..1) for 3D depth
 *   --msy          eased scroll progress through the hero (0..1) — NO collision with site-wide --sy
 *   --lx / --ly    silky-smooth torchlight coordinates tracking the cursor
 *   --torch-op     torchlight intensity easing
 *   canvas embers  rising sparks with ambient glow physics
 */
export function HeroMotion() {
  useEffect(() => {
    const hero = document.getElementById('mx-home');
    const fig = document.getElementById('mx-fig');
    const stageTorch = document.getElementById('mx-stage-torch');
    const canvas = document.getElementById('mx-embers') as HTMLCanvasElement | null;
    if (!hero || !fig) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cleanups: Array<() => void> = [];
    let visible = true;
    let isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    // Observe theme changes on <html>
    const themeObserver = new MutationObserver(() => {
      isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    cleanups.push(() => themeObserver.disconnect());

    // Reveal on scroll (if needed)
    const rev = Array.from(document.querySelectorAll<HTMLElement>('.mx-reveal'));
    if ('IntersectionObserver' in window && !reduce) {
      const io = new IntersectionObserver(
        (en) => en.forEach((x) => {
          if (x.isIntersecting) {
            x.target.classList.add('is-in');
            io.unobserve(x.target);
          }
        }),
        { threshold: 0.15 }
      );
      rev.forEach((el) => io.observe(el));
      cleanups.push(() => io.disconnect());
    } else {
      rev.forEach((el) => el.classList.add('is-in'));
    }

    if (reduce) return () => cleanups.forEach((f) => f());

    /* ---- Parallax, Scroll & Torchlight ---- */
    let tx = 0, ty = 0, cx = 0, cy = 0;
    let sy = 0, csy = 0;
    let tpx = 55, tpy = 42, curTpx = 55, curTpy = 42;
    let stx = 0, sty = 0, curStx = 0, curSty = 0;
    let torchOp = 0.55, targetTorchOp = 0.55;
    let ambientTorchOp = 0, targetAmbientTorchOp = 0;
    let lastPointer = 0, raf = 0;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || !isDark) return;
      const hr = hero.getBoundingClientRect();
      const inside = e.clientX >= hr.left && e.clientX <= hr.right && e.clientY >= hr.top && e.clientY <= hr.bottom;
      if (inside) {
        tx = ((e.clientX - hr.left) / hr.width - 0.5) * 2;
        ty = ((e.clientY - hr.top) / hr.height - 0.5) * 2;
        lastPointer = performance.now();

        // Ambient stage torch coordinates
        stx = e.clientX - hr.left;
        sty = e.clientY - hr.top;
        targetAmbientTorchOp = 0.85;

        // Figure-focused torch coordinates (% of Theyyam box)
        const f = fig.getBoundingClientRect();
        if (f.width > 0 && f.height > 0) {
          tpx = Math.max(8, Math.min(92, ((e.clientX - f.left) / f.width) * 100));
          tpy = Math.max(8, Math.min(92, ((e.clientY - f.top) / f.height) * 100));
          targetTorchOp = 0.95;
        }
      }
    };

    const onLeave = () => {
      tx = 0;
      ty = 0;
      tpx = 55;
      tpy = 42;
      targetTorchOp = 0.55;
      targetAmbientTorchOp = 0;
    };

    const onScroll = () => {
      const h = hero.offsetHeight || window.innerHeight;
      sy = Math.min(1, Math.max(0, window.scrollY / h));
    };

    hero.addEventListener('pointermove', onMove, { passive: true });
    hero.addEventListener('pointerleave', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    cleanups.push(() => {
      hero.removeEventListener('pointermove', onMove);
      hero.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', onScroll);
    });

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || !isDark) return;

      const idle = t - lastPointer > 2500;
      const gx = idle ? Math.sin(t / 3200) * 0.35 : tx;
      const gy = idle ? Math.cos(t / 4100) * 0.22 : ty;

      cx += (gx - cx) * 0.06;
      cy += (gy - cy) * 0.06;
      csy += (sy - csy) * 0.08;

      curTpx += (tpx - curTpx) * 0.08;
      curTpy += (tpy - curTpy) * 0.08;
      torchOp += (targetTorchOp - torchOp) * 0.08;

      curStx += (stx - curStx) * 0.1;
      curSty += (sty - curSty) * 0.1;
      ambientTorchOp += (targetAmbientTorchOp - ambientTorchOp) * 0.08;

      hero.style.setProperty('--mx', cx.toFixed(4));
      hero.style.setProperty('--my', cy.toFixed(4));
      hero.style.setProperty('--msy', csy.toFixed(4));

      fig.style.setProperty('--tpx', `${curTpx.toFixed(2)}%`);
      fig.style.setProperty('--tpy', `${curTpy.toFixed(2)}%`);
      fig.style.setProperty('--torch-op', torchOp.toFixed(3));

      if (stageTorch) {
        stageTorch.style.setProperty('--stx', `${curStx.toFixed(1)}px`);
        stageTorch.style.setProperty('--sty', `${curSty.toFixed(1)}px`);
        stageTorch.style.setProperty('--torch-ambient-op', ambientTorchOp.toFixed(3));
      }
    };

    raf = requestAnimationFrame(frame);
    cleanups.push(() => cancelAnimationFrame(raf));

    if ('IntersectionObserver' in window) {
      const vio = new IntersectionObserver(
        (en) => { visible = en[0].isIntersecting; },
        { threshold: 0 }
      );
      vio.observe(hero);
      cleanups.push(() => vio.disconnect());
    }

    /* ---- Canvas Rising Embers ---- */
    if (canvas) {
      const g = canvas.getContext('2d');
      if (g) {
        let W = 0, H = 0, eraf = 0;
        type Particle = { x: number; y: number; r: number; vy: number; ph: number; sw: number; life: number };
        const parts: Particle[] = [];

        const size = () => {
          const d = Math.min(2, window.devicePixelRatio || 1);
          W = canvas.clientWidth;
          H = canvas.clientHeight;
          if (W === 0 || H === 0) return;
          canvas.width = W * d;
          canvas.height = H * d;
          g.setTransform(d, 0, 0, d, 0, 0);
        };

        const make = (initial: boolean): Particle => {
          const fromTemple = Math.random() < 0.55;
          return {
            x: fromTemple ? W * (0.5 + Math.random() * 0.22) : Math.random() * W,
            y: initial ? Math.random() * H : H * (0.55 + Math.random() * 0.5),
            r: 0.6 + Math.random() * 2.1,
            vy: 0.25 + Math.random() * 0.9,
            ph: Math.random() * 6.28,
            sw: 0.2 + Math.random() * 0.6,
            life: 0.4 + Math.random() * 0.6,
          };
        };

        size();
        const n = W < 700 ? 26 : 70;
        for (let i = 0; i < n; i++) parts.push(make(true));
        window.addEventListener('resize', size, { passive: true });

        const tick = (t: number) => {
          eraf = requestAnimationFrame(tick);
          if (!visible || !isDark || document.hidden || W === 0 || H === 0) return;

          g.clearRect(0, 0, W, H);
          g.globalCompositeOperation = 'lighter';

          for (let i = 0; i < parts.length; i++) {
            const p = parts[i];
            p.y -= p.vy;
            p.x += Math.sin(t / 1100 + p.ph) * p.sw;
            const a = Math.max(0, Math.min(1, p.y / H)) * p.life * (0.55 + 0.45 * Math.sin(t / 260 + p.ph));
            if (p.y < -10 || a <= 0.01) {
              parts[i] = make(false);
              continue;
            }
            const gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
            gr.addColorStop(0, `rgba(255,214,140,${a})`);
            gr.addColorStop(0.35, `rgba(255,140,50,${a * 0.5})`);
            gr.addColorStop(1, 'rgba(255,100,20,0)');
            g.fillStyle = gr;
            g.beginPath();
            g.arc(p.x, p.y, p.r * 5, 0, 6.2832);
            g.fill();
          }
        };

        eraf = requestAnimationFrame(tick);
        cleanups.push(() => {
          cancelAnimationFrame(eraf);
          window.removeEventListener('resize', size);
        });
      }
    }

    return () => cleanups.forEach((f) => f());
  }, []);

  return null;
}

export default HeroMotion;
