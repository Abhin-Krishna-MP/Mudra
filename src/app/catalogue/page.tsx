import { getDb } from '@/lib/db';
import { listRecords } from '@/lib/repo';
import { searchRecords } from '@/lib/search';
import { PageSheet } from '@/components/PageSheet';
import { RecordTile } from '@/components/RecordTile';
import { Icon } from '@/components/Icons';
import { WORK_TYPE_ORDER, typeLabel } from '@/lib/ui';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Catalogue' };

export default async function Catalogue({ searchParams }: { searchParams: Promise<{ q?: string; region?: string; type?: string }> }) {
  const sp = await searchParams;
  const all = await listRecords(await getDb());
  const regions = [...new Set(all.map((r) => r.region))].sort();
  const present = new Set(all.map((r) => r.workType));
  const types = [...WORK_TYPE_ORDER.filter((t) => present.has(t)), ...[...present].filter((t) => !WORK_TYPE_ORDER.includes(t)).sort()];
  const items = searchRecords(all, sp.q ?? '', { region: sp.region || undefined, workType: sp.type || undefined });
  const href = (type: string) => {
    const p = new URLSearchParams();
    if (sp.q) p.set('q', sp.q); if (sp.region) p.set('region', sp.region); if (type) p.set('type', type);
    const s = p.toString(); return `/catalogue${s ? `?${s}` : ''}`;
  };
  return (
    <div className="wrap page">
      <PageSheet title="Catalogue" lede="Explore Kerala’s cultural expressions">
        <form role="search" method="get" action="/catalogue" id="search" className="ui">
          <div className="searchbar">
            <Icon name="search" size={20} />
            <label htmlFor="q" className="sr">Search by title, credited party or ID</label>
            <input id="q" name="q" type="search" defaultValue={sp.q ?? ''} placeholder="Search works, forms, communities…" />
            {sp.type && <input type="hidden" name="type" value={sp.type} />}
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
          <ul className="chip-row">
            <li><a href={href('')} aria-current={!sp.type ? 'true' : undefined}>All</a></li>
            {types.map((t) => <li key={t}><a href={href(t)} aria-current={sp.type === t ? 'true' : undefined}>{typeLabel(t)}</a></li>)}
          </ul>
        </nav>

        <p className="count ui" role="status">{items.length} {items.length === 1 ? 'record' : 'records'}{sp.q ? ` for “${sp.q}”` : ''}</p>
        {items.length === 0 ? (
          <div className="panel"><h2>No records found</h2><p>Try a different spelling, or <a href="/catalogue">clear the search</a>. Missing something? <a href="/submit">Submit a work</a>.</p></div>
        ) : (
          <ul className="tile-grid">{items.map((r, i) => <RecordTile key={r.id} r={r} i={i} />)}</ul>
        )}
      </PageSheet>
    </div>
  );
}
