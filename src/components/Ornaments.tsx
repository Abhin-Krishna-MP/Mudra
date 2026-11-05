/**
 * Original line/silhouette ornaments (lotus, palms, boat, lamp, parasol, waves) drawn in SVG so
 * the interface carries its Kerala character even before any generated art is dropped into
 * /public/mudra. All are decorative (aria-hidden) and colour themselves with currentColor.
 */

export function LotusMark({ size = 44 }: { size?: number }) {
  return (
    <svg className="lotus-mark" width={size} height={size} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M32 10c-5 6.5-6.5 14-6.5 20.5S28 42 32 46c4-4 6.5-9 6.5-15.5S37 16.5 32 10Z" />
      <path d="M32 46c-9-.5-17.5-5.5-20.5-17 6.5 1.2 11.5 3.2 14 6.5" />
      <path d="M32 46c9-.5 17.5-5.5 20.5-17-6.5 1.2-11.5 3.2-14 6.5" />
      <path d="M22.5 43.5c-6.5-.3-12-3.2-15.5-9 3.6.2 6.8 1.1 9.5 2.8" opacity=".75" />
      <path d="M41.5 43.5c6.5-.3 12-3.2 15.5-9-3.6.2-6.8 1.1-9.5 2.8" opacity=".75" />
      <path d="M17 52c5-2.6 10-3.8 15-3.8S42 49.4 47 52" />
      <path d="M22 57.5c3-1.4 6.5-2.1 10-2.1s7 .7 10 2.1" opacity=".7" />
    </svg>
  );
}

export function Palm({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 220" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M58 218c1-40 3-84 10-128l5 1c-4 44-6 86-6 127Z" />
      <path d="M66 86C48 70 26 66 6 74c18-2 32 2 44 10-14-2-27 2-38 14 14-8 28-8 41-2-10 4-18 12-22 24 10-12 20-18 33-18Z" />
      <path d="M70 86c17-18 38-26 60-22-18 1-31 7-41 16 15-4 28-2 37 5-14-1-24 1-34 8 8 0 15 4 20 12-9-7-18-9-29-6Z" transform="translate(-14 2)" />
      <path d="M68 84c-4-20 2-42 18-58-8 14-10 28-8 42 6-12 14-20 26-24-10 8-17 18-19 30Z" />
      <path d="M62 86C54 66 56 44 70 26c-5 14-4 28 1 42 2-10 7-18 16-24-7 9-11 20-11 33Z" transform="translate(-6 0)" />
    </svg>
  );
}

export function Kettuvallam({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 260 90" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M8 58c18 14 52 20 122 20s104-6 122-20c-8-2-14-6-18-12H26c-4 6-10 10-18 12Z" />
      <path d="M44 44c10-22 26-34 86-34s76 12 86 34Z" opacity=".92" />
      <path d="M124 10V2h12v8Z" />
      <path d="M0 84c20-5 40-5 60 0s40 5 60 0 40-5 60 0 40 5 60 0 20-3 20-3v6s-0 2-20 2-40-5-60 0-40 5-60 0-40-5-60 0-40 5-60 0Z" opacity=".35" />
    </svg>
  );
}

/** Nilavilakku, the Kerala standing lamp. */
export function Lamp({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 260" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="lampG" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8a5a12" /><stop offset=".45" stopColor="#f1c85a" /><stop offset="1" stopColor="#8a5a12" />
        </linearGradient>
        <radialGradient id="flameG" cx=".5" cy=".7" r=".6">
          <stop offset="0" stopColor="#fff4c2" /><stop offset=".6" stopColor="#ffb02e" /><stop offset="1" stopColor="#ff7a1a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="238" rx="38" ry="9" fill="url(#lampG)" />
      <path d="M44 238c2-26 6-46 16-62 10 16 14 36 16 62Z" fill="url(#lampG)" />
      <rect x="55" y="96" width="10" height="82" rx="5" fill="url(#lampG)" />
      <circle cx="60" cy="150" r="9" fill="url(#lampG)" />
      <circle cx="60" cy="118" r="6" fill="url(#lampG)" />
      <path d="M14 92c0 10 10 16 22 16h48c12 0 22-6 22-16-10 4-22 5-46 5s-36-1-46-5Z" fill="url(#lampG)" />
      <path d="M20 86h80" stroke="url(#lampG)" strokeWidth="5" strokeLinecap="round" />
      {[22, 40, 60, 80, 98].map((x, i) => (
        <g key={x}>
          <path d={`M${x - 6} 84c0-4 3-6 6-6s6 2 6 6Z`} fill="url(#lampG)" />
          <ellipse cx={x} cy={i === 2 ? 66 : 74} rx="9" ry="14" fill="url(#flameG)" />
        </g>
      ))}
      <path d="M60 52c-6 6-6 11 0 16 6-5 6-10 0-16Z" fill="url(#lampG)" />
    </svg>
  );
}

/** Muthukuda, the ceremonial parasol. */
export function Parasol({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 160 150" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="parG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f07a1c" /><stop offset="1" stopColor="#b8410c" />
        </linearGradient>
      </defs>
      <path d="M8 74C14 36 46 12 80 12s66 24 72 62c-12-8-24-8-36 0-12-8-24-8-36 0-12-8-24-8-36 0-12-8-24-8-36 0Z" fill="url(#parG)" />
      <path d="M80 12c-14 10-22 36-20 62M80 12c14 10 22 36 20 62M80 12v62M80 12C52 20 34 44 36 74M80 12c28 8 46 32 44 62" stroke="#7a2a06" strokeWidth="1.6" fill="none" opacity=".55" />
      <circle cx="80" cy="9" r="4" fill="#f4c24a" />
      <path d="M80 74v70" stroke="#6b3a14" strokeWidth="4" strokeLinecap="round" />
      <path d="M8 74c12-8 24-8 36 0M44 74c12-8 24-8 36 0M80 74c12-8 24-8 36 0M116 74c12-8 24-8 36 0" stroke="#f4c24a" strokeWidth="2.2" fill="none" />
    </svg>
  );
}

export function Waves({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 600 24" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" focusable="false">
      <path d="M0 8c25 0 25 8 50 8s25-8 50-8 25 8 50 8 25-8 50-8 25 8 50 8 25-8 50-8 25 8 50 8 25-8 50-8 25 8 50 8 25-8 50-8 25 8 50 8 25-8 50-8" />
      <path d="M0 17c25 0 25 6 50 6s25-6 50-6 25 6 50 6 25-6 50-6 25 6 50 6 25-6 50-6 25 6 50 6 25-6 50-6 25 6 50 6 25-6 50-6 25 6 50 6 25-6 50-6" opacity=".55" />
    </svg>
  );
}

/** Small scene used as the soft banner motif on inner page headers when no photo is supplied. */
export function BannerScene({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <Palm className="scene-palm scene-palm-a" />
      <Palm className="scene-palm scene-palm-b" />
      <Kettuvallam className="scene-boat" />
    </div>
  );
}
