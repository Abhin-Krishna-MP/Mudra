import './catalogue.css';
import { getDb } from '@/lib/db';
import { listRecords } from '@/lib/repo';
import { searchRecords } from '@/lib/search';
import { PageSheet } from '@/components/PageSheet';
import { RecordTile } from '@/components/RecordTile';
import { Icon, type IconName } from '@/components/Icons';
import { WORK_TYPE_ORDER, typeLabel } from '@/lib/ui';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Catalogue' };

type SP = { q?: string; region?: string; type?: string; sort?: string; view?: string };

const SORTS: Record<string, string> = { recent: 'Recently Added', az: 'Title A–Z', za: 'Title Z–A', region: 'Region' };
const TYPE_ICON: Record<string, IconName> = { ritual: 'lotus', performing: 'drum', visual: 'palette', craft: 'bell', other: 'leaf' };

/** Small woven-pattern mark for Textiles (no matching glyph in the shared icon set). */
function WeaveIcon() {
  return (
    <svg className="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3 21 12 12 21 3 12Z" /><path d="M12 7.5 16.5 12 12 16.5 7.5 12Z" /><path d="M12 3v18M3 12h18" />
    </svg>
  );
}
function TypeGlyph({ t }: { t: string }) {
  if (t === 'textile') return <WeaveIcon />;
  return <Icon name={TYPE_ICON[t] ?? 'layers'} size={24} />;
}

export default async function Catalogue({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const all = await listRecords(await getDb());
  const regions = [...new Set(all.map((r) => r.region))].sort();
  const present = new Set(all.map((r) => r.workType));
  const types = [...WORK_TYPE_ORDER.filter((t) => present.has(t)), ...[...present].filter((t) => !WORK_TYPE_ORDER.includes(t)).sort()];
  const found = searchRecords(all, sp.q ?? '', { region: sp.region || undefined, workType: sp.type || undefined });

  const sort = sp.sort && SORTS[sp.sort] ? sp.sort : 'recent';
  const view = sp.view === 'list' ? 'list' : 'grid';
  const items = [...found];
  if (sort === 'az') items.sort((a, b) => a.title.localeCompare(b.title));
  if (sort === 'za') items.sort((a, b) => b.title.localeCompare(a.title));
  if (sort === 'region') items.sort((a, b) => a.region.localeCompare(b.region) || a.title.localeCompare(b.title));

  /** Builds a catalogue URL that keeps the current filters and swaps in the given overrides. */
  const href = (o: Partial<SP> = {}) => {
    const next = { q: sp.q, region: sp.region, type: sp.type, sort: sort === 'recent' ? undefined : sort, view: view === 'grid' ? undefined : view, ...o };
    const p = new URLSearchParams();
    (Object.keys(next) as (keyof SP)[]).forEach((k) => { const v = next[k]; if (v) p.set(k, v); });
    const s = p.toString();
    return `/catalogue${s ? `?${s}` : ''}`;
  };

  return (
    <div className="wrap page cat-page">
      <PageSheet eyebrow="Catalogue" title="Catalogue" lede="Explore Kerala’s cultural expressions">
        <form role="search" method="get" action="/catalogue" id="search" className="ui">
          <div className="searchbar">
            <Icon name="search" size={20} />
            <label htmlFor="q" className="sr">Search by title, credited party or ID</label>
            <input id="q" name="q" type="search" defaultValue={sp.q ?? ''} placeholder="Search works, forms, communities…" />
            {sp.type && <input type="hidden" name="type" value={sp.type} />}
            {sort !== 'recent' && <input type="hidden" name="sort" value={sort} />}
            {view === 'list' && <input type="hidden" name="view" value="list" />}
            <details className="filters">
              <summary aria-label="Filter by region"><Icon name="filter" size={22} /></summary>
              <div className="pop">
                <label htmlFor="region">Region</label>
                <select id="region" name="region" defaultValue={sp.region ?? ''}><option value="">All regions</option>{regions.map((r) => <option key={r}>{r}</option>)}</select>
              </div>
            </details>
            <button type="submit" className="go">Search</button>
          </div>
        </form>

        <nav aria-label="Type of work">
          <ul className="chip-row cat-chips">
            <li><a href={href({ type: undefined })} aria-current={!sp.type ? 'true' : undefined}><Icon name="grid" size={24} /><span>All</span></a></li>
            {types.map((t) => (
              <li key={t}><a href={href({ type: t })} aria-current={sp.type === t ? 'true' : undefined}><TypeGlyph t={t} /><span>{typeLabel(t)}</span></a></li>
            ))}
          </ul>
        </nav>

        <div className="cat-bar ui">
          <p className="count" role="status">{items.length} {items.length === 1 ? 'record' : 'records'}{sp.q ? ` for “${sp.q}”` : ''}</p>
          <div className="cat-tools">
            <div className="view-toggle" role="group" aria-label="Layout">
              <a href={href({ view: undefined })} aria-label="Grid view" aria-current={view === 'grid' ? 'true' : undefined}><Icon name="grid" size={18} /></a>
              <a href={href({ view: 'list' })} aria-label="List view" aria-current={view === 'list' ? 'true' : undefined}><Icon name="menu" size={18} /></a>
            </div>
            <details className="sort">
              <summary aria-label="Sort records"><span>{SORTS[sort]}</span><Icon name="chevDown" size={16} /></summary>
              <ul>
                {Object.entries(SORTS).map(([k, label]) => (
                  <li key={k}><a href={href({ sort: k === 'recent' ? undefined : k })} aria-current={sort === k ? 'true' : undefined}>{label}</a></li>
                ))}
              </ul>
            </details>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="panel"><h2>No records found</h2><p>Try a different spelling, or <a href="/catalogue">clear the search</a>. Missing something? <a href="/submit">Submit a work</a>.</p></div>
        ) : (
          <ul className={`tile-grid cat-grid${view === 'list' ? ' is-list' : ''}`}>{items.map((r, i) => <RecordTile key={r.id} r={r} i={i} catalogue />)}</ul>
        )}
      </PageSheet>
    </div>
  );
}
