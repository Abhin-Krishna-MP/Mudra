'use client';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from './Icons';

/** Horizontally scrolling strip with drag-to-scroll, wheel support, auto-play, previous/next buttons and page dots. */
export function Carousel({ label, children }: { label: string; children: ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(0);

  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const velocityRef = useRef(0);
  const isHoveredRef = useRef(false);
  const isFocusedRef = useRef(false);

  const getSnapPoints = (el: HTMLElement) => {
    const items = Array.from(el.querySelectorAll<HTMLElement>('li'));
    if (items.length === 0) return [];
    const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    const elRect = el.getBoundingClientRect();
    return items.map((li) => {
      const liRect = li.getBoundingClientRect();
      return Math.max(0, Math.round(el.scrollLeft + (liRect.left - elRect.left) - pad));
    });
  };

  const smoothScrollTo = useCallback((el: HTMLElement, targetLeft: number) => {
    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
  }, []);

  const by = useCallback((dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 4) return;

    const snapPoints = getSnapPoints(el);
    if (snapPoints.length === 0) return;

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
  }, [smoothScrollTo]);

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

  const resetAutoPlay = useCallback(() => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    autoPlayTimerRef.current = setInterval(() => {
      if (
        !isHoveredRef.current &&
        !isFocusedRef.current &&
        !isDraggingRef.current &&
        typeof document !== 'undefined' &&
        document.visibilityState === 'visible'
      ) {
        by(1);
      }
    }, 4500);
  }, [by]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    el.addEventListener('scroll', measure, { passive: true });
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(el);

    // Mouse wheel vertical-to-horizontal conversion
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && el.scrollWidth > el.clientWidth) {
        e.preventDefault();
        el.style.scrollSnapType = 'none';
        el.scrollLeft += e.deltaY;
        resetAutoPlay();
        if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
        wheelTimerRef.current = setTimeout(() => {
          el.style.scrollSnapType = '';
        }, 150);
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });

    // Start auto-play
    resetAutoPlay();

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') resetAutoPlay();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      el.removeEventListener('scroll', measure);
      el.removeEventListener('wheel', onWheel);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      ro?.disconnect();
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [measure, resetAutoPlay]);

  // Pointer drag-to-scroll handlers
  const onPointerDown = (e: React.PointerEvent<HTMLUListElement>) => {
    if (e.button !== 0) return; // Only primary mouse button
    const el = ref.current;
    if (!el) return;

    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.clientX;
    startScrollLeftRef.current = el.scrollLeft;
    lastXRef.current = e.clientX;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
    resetAutoPlay();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLUListElement>) => {
    if (!isDraggingRef.current) return;
    const el = ref.current;
    if (!el) return;

    const dx = e.clientX - startXRef.current;
    if (!hasDraggedRef.current && Math.abs(dx) > 6) {
      hasDraggedRef.current = true;
      el.style.scrollSnapType = 'none';
      el.classList.add('is-dragging');
      try {
        el.setPointerCapture(e.pointerId);
      } catch {}
    }

    if (hasDraggedRef.current) {
      el.scrollLeft = startScrollLeftRef.current - dx;
      const now = performance.now();
      const dt = now - lastTimeRef.current;
      if (dt > 10) {
        velocityRef.current = (e.clientX - lastXRef.current) / dt;
        lastXRef.current = e.clientX;
        lastTimeRef.current = now;
      }
    }
  };

  const endDrag = (e: React.PointerEvent<HTMLUListElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const el = ref.current;
    if (!el) return;

    el.classList.remove('is-dragging');
    try {
      if (el.hasPointerCapture(e.pointerId)) {
        el.releasePointerCapture(e.pointerId);
      }
    } catch {}

    if (hasDraggedRef.current) {
      const snapPoints = getSnapPoints(el);
      const current = el.scrollLeft;
      if (snapPoints.length > 0) {
        let closest = snapPoints[0] ?? 0;
        let minDiff = Math.abs(current - closest);
        for (const p of snapPoints) {
          const diff = Math.abs(current - p);
          if (diff < minDiff) {
            minDiff = diff;
            closest = p;
          }
        }
        // Apply flick direction if swiped with velocity
        if (Math.abs(velocityRef.current) > 0.25) {
          if (velocityRef.current < 0) {
            const next = snapPoints.find((p) => p > current + 20);
            if (next !== undefined) closest = next;
          } else {
            const prev = [...snapPoints].reverse().find((p) => p < current - 20);
            if (prev !== undefined) closest = prev;
          }
        }
        smoothScrollTo(el, closest);
      } else {
        el.style.scrollSnapType = '';
      }
    } else {
      el.style.scrollSnapType = '';
    }
    resetAutoPlay();
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (hasDraggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      hasDraggedRef.current = false;
    }
  };

  return (
    <div
      className="carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => {
        isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
        resetAutoPlay();
      }}
      onFocusCapture={() => {
        isFocusedRef.current = true;
      }}
      onBlurCapture={() => {
        isFocusedRef.current = false;
        resetAutoPlay();
      }}
    >
      <div className="car-stage">
        <ul
          className="car-track"
          ref={ref}
          tabIndex={0}
          aria-label={`${label}, scrollable`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={onClickCapture}
        >
          {children}
        </ul>
        <button
          type="button"
          className="car-btn prev"
          onClick={() => {
            by(-1);
            resetAutoPlay();
          }}
          aria-label="Previous works"
        >
          <Icon name="chevL" size={20} />
        </button>
        <button
          type="button"
          className="car-btn next"
          onClick={() => {
            by(1);
            resetAutoPlay();
          }}
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
              onClick={() => {
                to(n);
                resetAutoPlay();
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
