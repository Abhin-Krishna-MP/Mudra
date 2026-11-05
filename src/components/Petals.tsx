import type { CSSProperties } from 'react';

/** Drifting marigold petals (or embers in the dark theme). Pure CSS motion; deterministic values so server and client markup match. */
const N = 16;
export function Petals() {
  return (
    <div className="petals" aria-hidden="true">
      {Array.from({ length: N }, (_, i) => {
        const style = {
          '--x': `${(i * 37 + 7) % 100}%`,
          '--d': `${14 + ((i * 5) % 9)}s`,
          '--delay': `${-((i * 3.1) % 18).toFixed(1)}s`,
          '--s': `${10 + ((i * 7) % 12)}px`,
          '--sway': `${((i % 2 ? 1 : -1) * (40 + ((i * 13) % 90)))}px`,
          '--spin': `${(i % 3) + 1}`,
        } as CSSProperties;
        return <i key={i} style={style} />;
      })}
    </div>
  );
}
