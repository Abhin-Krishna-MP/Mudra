import type { CSSProperties } from 'react';

/**
 * A slowly turning lotus built from CSS-3D petals. Decorative; static when motion is reduced.
 * Rings marked `lx` are extra petals that only the dark theme draws (the light theme keeps its original four rings).
 */
const RINGS: { n: number; tilt: number; off: number; cls: string; lx?: boolean }[] = [
  { n: 12, tilt: 84, off: 15, cls: 'r4', lx: true },
  { n: 10, tilt: 74, off: 0, cls: 'r3' },
  { n: 9, tilt: 62, off: 20, cls: 'r25', lx: true },
  { n: 8, tilt: 52, off: 22.5, cls: 'r2' },
  { n: 7, tilt: 30, off: 0, cls: 'r1' },
  { n: 5, tilt: 10, off: 12, cls: 'r0' },
];
const STAMENS = Array.from({ length: 14 }, (_, i) => ({ a: (360 / 14) * i + 6, t: 10 + (i % 3) * 7 }));
const MOTES = [
  { x: '18%', d: '9s', l: '0s' }, { x: '34%', d: '11s', l: '2.4s' }, { x: '52%', d: '8s', l: '5s' },
  { x: '68%', d: '12s', l: '1.2s' }, { x: '80%', d: '10s', l: '3.6s' }, { x: '44%', d: '13s', l: '6.5s' },
];

export function Lotus3D() {
  return (
    <div className="lotus-stage" aria-hidden="true">
      <div className="lotus-glow" />
      <div className="lotus-halo" />
      <div className="lotus3d">
        <b className="lotus-pad" />
        {RINGS.map((r) => Array.from({ length: r.n }, (_, i) => (
          <i key={`${r.cls}-${i}`} className={`${r.cls}${r.lx ? ' lx' : ''}`} style={{ '--a': `${r.off + (360 / r.n) * i}deg`, '--t': `${r.tilt}deg` } as CSSProperties} />
        )))}
        {STAMENS.map((s, i) => <s key={i} className="lx" style={{ '--a': `${s.a}deg`, '--t': `${s.t}deg` } as CSSProperties} />)}
        <b className="lotus-core" />
      </div>
      <div className="lotus-water"><span /><span /><span /></div>
      <div className="lotus-motes">{MOTES.map((m, i) => <em key={i} style={{ '--x': m.x, '--d': m.d, '--l': m.l } as CSSProperties} />)}</div>
    </div>
  );
}
