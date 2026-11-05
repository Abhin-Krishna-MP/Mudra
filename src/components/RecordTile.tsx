import type { RecordSummary } from '@/lib/contracts';
import { typeSingular } from '@/lib/ui';
import { Icon } from './Icons';

/**
 * Gallery tile. The artwork is NEVER cropped: it is fitted inside the tile (object-fit: contain)
 * and the tile behind it is filled with a blurred, tinted copy of the same image so the frame
 * still reads as a full-bleed picture.
 */
export function RecordTile({ r, compact, i = 0 }: { r: RecordSummary; compact?: boolean; i?: number }) {
  return (
    <li className={`tile${compact ? ' tile-compact' : ''}`} data-reveal style={{ '--i': i % 8 } as React.CSSProperties}>
      <a className="tile-link" href={`/r/${r.id}`} data-tilt="9">
        <span className="tile-art" style={r.thumbUrl ? { backgroundImage: `url("${r.thumbUrl}")` } : undefined}>
          {r.thumbUrl ? <img src={r.thumbUrl} alt={r.alt} loading="lazy" /> : <span className="tile-withheld">Image withheld</span>}
        </span>
        <span className="tile-shade" aria-hidden="true" />
        <span className="tile-text">
          <span className="tile-title">{r.title}</span>
          <span className="tile-sub">{typeSingular(r.workType)} · {r.region}</span>
        </span>
        <span className="tile-go" aria-hidden="true"><Icon name="arrow" size={compact ? 14 : 18} /></span>
      </a>
    </li>
  );
}
