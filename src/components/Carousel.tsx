'use client';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from './Icons';

/** Horizontally scrolling strip with previous/next buttons and page dots. Works by touch, keyboard (the strip is focusable), buttons and dots. */
export function Carousel({ label, children }: { label: string; children: ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(0);

  const step = (el: HTMLElement) => Math.max(240, el.clientWidth * 0.8);
  const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const by = (dir: 1 | -1) => {
    const el = ref.current; if (!el) return;
    el.scrollBy({ left: dir * step(el), behavior: reduce() ? 'auto' : 'smooth' });
  };
  const to = (n: number) => {
    const el = ref.current; if (!el) return;
    el.scrollTo({ left: n * step(el), behavior: reduce() ? 'auto' : 'smooth' });
  };

  const measure = useCallback(() => {
    const el = ref.current; if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const count = max <= 4 ? 1 : Math.ceil(max / step(el)) + 1;
    setPages(count);
    setPage(max <= 4 ? 0 : el.scrollLeft >= max - 4 ? count - 1 : Math.min(count - 1, Math.round(el.scrollLeft / step(el))));
  }, []);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    measure();
    el.addEventListener('scroll', measure, { passive: true });
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    return () => { el.removeEventListener('scroll', measure); ro?.disconnect(); };
  }, [measure]);

  return (
    <div className="carousel" role="region" aria-roledescription="carousel" aria-label={label}>
      <div className="car-stage">
        <button type="button" className="car-btn prev" onClick={() => by(-1)} aria-label="Previous works"><Icon name="chevL" size={20} /></button>
        <ul className="car-track" ref={ref} tabIndex={0} aria-label={`${label}, scrollable`}>{children}</ul>
        <button type="button" className="car-btn next" onClick={() => by(1)} aria-label="Next works"><Icon name="chevR" size={20} /></button>
      </div>
      {pages > 1 && (
        <div className="car-dots" role="group" aria-label="Choose a page of works">
          {Array.from({ length: pages }, (_, n) => (
            <button key={n} type="button" className="car-dot" aria-label={`Page ${n + 1} of ${pages}`} aria-current={n === page ? 'true' : undefined} onClick={() => to(n)} />
          ))}
        </div>
      )}
    </div>
  );
}
