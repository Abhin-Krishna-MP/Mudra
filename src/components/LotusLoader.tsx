'use client';
import type { ReactNode } from 'react';

export interface LotusLoaderProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  label?: ReactNode;
  fullPage?: boolean;
  inline?: boolean;
  className?: string;
  ripples?: boolean;
}

export function LotusLoader({
  size = 'md',
  label,
  fullPage = false,
  inline = false,
  className = '',
  ripples = true,
}: LotusLoaderProps) {
  const showRipples = ripples && size !== 'xs' && size !== 'sm' && !inline;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`lotus-loader-wrap size-${size}${fullPage ? ' is-fullpage' : ''}${inline ? ' is-inline' : ''}${className ? ' ' + className : ''}`}
    >
      <div className="lotus-loader-stage">
        {showRipples && (
          <div className="lotus-loader-ripples" aria-hidden="true">
            <span className="lotus-loader-ripple" />
            <span className="lotus-loader-ripple" />
            <span className="lotus-loader-ripple" />
          </div>
        )}
        <div className="lotus-loader-aura" aria-hidden="true" />
        <picture>
          <source srcSet="/mudra/lotus-loader.webp" type="image/webp" />
          <img
            src="/mudra/lotus-loader.gif"
            alt=""
            aria-hidden="true"
            className="lotus-loader-art"
            width={441}
            height={240}
          />
        </picture>
      </div>
      {label && <span className="lotus-loader-label">{label}</span>}
    </div>
  );
}
