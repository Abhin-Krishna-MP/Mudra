import { getDb } from '@/lib/db';
import { listRecords } from '@/lib/repo';
import { searchRecords } from '@/lib/search';
import { PermissionChips } from '@/components/Permissions';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string; region?: string; type?: string }> }) {
  const sp = await searchParams;
  const all = await listRecords(await getDb());
  const regions = [...new Set(all.map((r) => r.region))].sort();
  const types = [...new Set(all.map((r) => r.workType))].sort();
  const items = searchRecords(all, sp.q ?? '', { region: sp.region || undefined, workType: sp.type || undefined });
  return (
    <>
      <h1>Know what you may do with a cultural work, before you reuse it.</h1>
      <p className="muted">Search a record, see who it comes from, and read what the creators and the licence say. Mudra records what is stated; it does not decide who owns what.</p>
      <form role="search" method="get" className="panel ui" style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', alignItems: 'end' }}>
        <div><label htmlFor="q">Search by title, credited party or ID</label><input id="q" name="q" type="search" defaultValue={sp.q ?? ''} placeholder="e.g. Teyyam or MDR-2026-0001" /></div>
        <div><label htmlFor="region">Region</label><select id="region" name="region" defaultValue={sp.region ?? ''}><option value="">All regions</option>{regions.map((r) => <option key={r}>{r}</option>)}</select></div>
        <div><label htmlFor="type">Type of work</label><select id="type" name="type" defaultValue={sp.type ?? ''}><option value="">All types</option>{types.map((r) => <option key={r}>{r}</option>)}</select></div>
        <button type="submit">Search</button>
      </form>
      <p className="ui muted" role="status">{items.length} {items.length === 1 ? 'record' : 'records'}{sp.q ? ` for “${sp.q}”` : ''}</p>
      {items.length === 0 ? (
        <div className="panel"><h2>No records found</h2><p>Try a different spelling, or <a href="/">clear the search</a>. Missing something? <a href="/submit">Submit a work</a>.</p></div>
      ) : (
        <ul className="grid">
          {items.map((r) => (
            <li key={r.id} className="card">
              <a className="cover" href={`/r/${r.id}`}>
                <div className="mat">{r.thumbUrl ? <img src={r.thumbUrl} alt={r.alt} loading="lazy" /> : <span className="muted ui">Image withheld</span>}</div>
              </a>
              <div className="body">
                <h3><a href={`/r/${r.id}`}>{r.title}</a></h3>
                <p className="muted" style={{ margin: 0 }}>{r.id} · {r.region}</p>
                <p style={{ margin: '4px 0' }}>Credit: {r.primaryCredit || 'not yet credited'}</p>
                <PermissionChips permissions={r.permissions} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
