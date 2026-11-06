import type { RecordSummary } from '@/lib/contracts';
import { typeSingular } from '@/lib/ui';
import { Icon, type IconName } from './Icons';

/** Picks a small emblem for the card: the art form when the title names it, otherwise the work type. */
function emblem(r: RecordSummary): IconName {
  const t = r.title.toLowerCase();
  if (/kalari|martial/.test(t)) return 'swords';
  if (/panchavadyam|percussion|chenda|drum|melam/.test(t)) return 'drum';
  if (/bell|nilavilakku|metal|lamp/.test(t)) return 'bell';
  if (/mohiniyattam|classical dance/.test(t)) return 'lotus';
  if (/theyyam|kathakali|ottanthullal|kudiyattam|mask|dance-drama/.test(t)) return 'mask';
  switch (r.workType) {
    case 'craft': return 'bell';
    case 'visual': return 'palette';
    case 'textile': return 'layers';
    case 'performing': return 'mask';
    case 'ritual': return 'lotus';
    default: return 'lotus';
  }
}

/**
 * Gallery tile. In the plain grid the artwork is NEVER cropped: it is fitted inside the tile (object-fit: contain)
 * and the tile behind it is filled with a blurred, tinted copy of the same image so the frame
 * still reads as a full-bleed picture. The compact (home carousel) arch carries a small emblem badge.
 */
export function RecordTile({ r, compact, i = 0 }: { r: RecordSummary; compact?: boolean; i?: number }) {
  const ico = emblem(r);
  return (
    <li className={`tile${compact ? ' tile-compact' : ''}`} data-reveal style={{ '--i': i % 8 } as React.CSSProperties}>
      <a className="tile-link" href={`/r/${r.id}`} data-tilt="9">
        <span className="tile-art" style={r.thumbUrl ? { backgroundImage: `url("${r.thumbUrl}")` } : undefined}>
          {r.thumbUrl ? <img src={r.thumbUrl} alt={r.alt} loading="lazy" /> : <span className="tile-withheld">Image withheld</span>}
        </span>
        <span className="tile-shade" aria-hidden="true" />
        {compact && <span className="tile-badge" aria-hidden="true"><Icon name={ico} size={18} /></span>}
        <span className="tile-text">
          <span className="tile-title">{r.title}</span>
          <span className="tile-sub">
            {compact && <Icon name={ico} size={13} className="ts-ico" />}
            <span>{typeSingular(r.workType)} · {r.region}</span>
          </span>
        </span>
        <span className="tile-go" aria-hidden="true"><Icon name="arrow" size={compact ? 14 : 18} /></span>
      </a>
    </li>
  );
}
