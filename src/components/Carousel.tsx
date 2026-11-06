'use client';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from './Icons';

/** Horizontally scrolling strip with previous/next buttons and page dots. Works by touch, keyboard (the strip is focusable), buttons and dots. */
export function Carousel({ label, children }: { label: string; children: ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(0);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const smoothScrollTo = (el: HTMLElement, targetLeft: number) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      el.scrollLeft = targetLeft;
      return;
    }

    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = null;
    }

    // Temporarily release CSS scroll snapping so WebKit/Blink won't abort programmatic smooth scrolling
    el.style.scrollSnapType = 'none';
    el.scrollTo({ left: targetLeft, behavior: 'smooth' });

    const restore = () => {
      el.style.scrollSnapType = '';
      el.removeEventListener('scrollend', restore);
      scrollTimerRef.current = null;
    };

    if ('onscrollend' in window) {
      el.addEventListener('scrollend', restore, { once: true });
    }
    scrollTimerRef.current = setTimeout(restore, 500);
  };

  const by = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 4) return;

    const items = Array.from(el.querySelectorAll<HTMLElement>('li'));
    if (items.length === 0) return;

    const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    const elRect = el.getBoundingClientRect();
    const snapPoints = items.map((li) => {
      const liRect = li.getBoundingClientRect();
      return Math.max(0, Math.round(el.scrollLeft + (liRect.left - elRect.left) - pad));
    });

    const current = el.scrollLeft;
    const step = Math.max(240, el.clientWidth * 0.8);

    let targetLeft: number;

    if (dir === 1) {
      if (current >= max - 15) {
        targetLeft = 0;
      } else {
        const candidate = snapPoints.find((p) => p >= current + step * 0.6);
        targetLeft = candidate !== undefined ? Math.min(max, candidate) : max;
      }
    } else {
      if (current <= 15) {
        targetLeft = max;
      } else {
        const reversed = [...snapPoints].reverse();
        const candidate = reversed.find((p) => p <= current - step * 0.6);
        targetLeft = candidate !== undefined ? Math.max(0, candidate) : 0;
      }
    }

    smoothScrollTo(el, targetLeft);
  };

  const to = (n: number) => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 4) return;
    const step = Math.max(240, el.clientWidth * 0.8);
    const targetLeft = Math.min(max, Math.round(n * step));
    smoothScrollTo(el, targetLeft);
  };

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 4) {
      setPages(1);
      setPage(0);
      return;
    }
    const step = Math.max(240, el.clientWidth * 0.8);
    const count = Math.ceil(max / step) + 1;
    setPages(count);
    const cur = el.scrollLeft >= max - 15 ? count - 1 : Math.min(count - 1, Math.round(el.scrollLeft / step));
    setPage(cur);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    el.addEventListener('scroll', measure, { passive: true });
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    return () => {
      el.removeEventListener('scroll', measure);
      ro?.disconnect();
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, [measure]);

  return (
    <div className="carousel" role="region" aria-roledescription="carousel" aria-label={label}>
      <div className="car-stage">
        <ul className="car-track" ref={ref} tabIndex={0} aria-label={`${label}, scrollable`}>
          {children}
        </ul>
        <button
          type="button"
          className="car-btn prev"
          onClick={() => by(-1)}
          aria-label="Previous works"
        >
          <Icon name="chevL" size={20} />
        </button>
        <button
          type="button"
          className="car-btn next"
          onClick={() => by(1)}
          aria-label="Next works"
        >
          <Icon name="chevR" size={20} />
        </button>
      </div>
      {pages > 1 && (
        <div className="car-dots" role="group" aria-label="Choose a page of works">
          {Array.from({ length: pages }, (_, n) => (
            <button
              key={n}
              type="button"
              className="car-dot"
              aria-label={`Page ${n + 1} of ${pages}`}
              aria-current={n === page ? 'true' : undefined}
              onClick={() => to(n)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
