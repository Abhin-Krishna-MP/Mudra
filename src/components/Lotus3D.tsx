import type { CSSProperties } from 'react';

/** A slowly turning lotus built from CSS-3D petals. Decorative; static when motion is reduced. */
const RINGS: { n: number; tilt: number; off: number; cls: string }[] = [
  { n: 10, tilt: 74, off: 0, cls: 'r3' },
  { n: 8, tilt: 52, off: 22.5, cls: 'r2' },
  { n: 7, tilt: 30, off: 0, cls: 'r1' },
  { n: 5, tilt: 10, off: 12, cls: 'r0' },
];
export function Lotus3D() {
  return (
    <div className="lotus-stage" aria-hidden="true">
      <div className="lotus-glow" />
      <div className="lotus3d">
        {RINGS.map((r) => Array.from({ length: r.n }, (_, i) => (
          <i key={`${r.cls}-${i}`} className={r.cls} style={{ '--a': `${r.off + (360 / r.n) * i}deg`, '--t': `${r.tilt}deg` } as CSSProperties} />
        )))}
        <b className="lotus-core" />
      </div>
      <div className="lotus-water"><span /><span /><span /></div>
    </div>
  );
}
