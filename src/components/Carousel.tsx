'use client';
import { useRef, type ReactNode } from 'react';
import { Icon } from './Icons';

/** Horizontally scrolling strip with previous/next buttons. Works by touch, keyboard (the strip is focusable) and buttons. */
export function Carousel({ label, children }: { label: string; children: ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);
  const by = (dir: 1 | -1) => {
    const el = ref.current; if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * Math.max(240, el.clientWidth * 0.8), behavior: reduce ? 'auto' : 'smooth' });
  };
  return (
    <div className="carousel" role="region" aria-roledescription="carousel" aria-label={label}>
      <button type="button" className="car-btn prev" onClick={() => by(-1)} aria-label="Previous works"><Icon name="chevL" size={20} /></button>
      <ul className="car-track" ref={ref} tabIndex={0} aria-label={`${label}, scrollable`}>{children}</ul>
      <button type="button" className="car-btn next" onClick={() => by(1)} aria-label="Next works"><Icon name="chevR" size={20} /></button>
    </div>
  );
}
