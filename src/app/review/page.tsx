import { getDb } from '@/lib/db';
import { getActor } from '@/lib/session';
import { listRecords, listFlags } from '@/lib/repo';
import { reviewFormAction, logoutAction } from '@/app/actions';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Reviewer console' };

export default async function Review({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const sp = await searchParams;
  const actor = await getActor();
  if (!actor || !['reviewer', 'admin'].includes(actor.role)) return (<><h1>Reviewer sign-in</h1><p className="muted">For reviewers only. The README lists a demo account.</p><LoginForm /></>);
  const db = await getDb();
  const records = await listRecords(db, { reviewer: true });
  const rows = (await db.execute("SELECT id, status, verification_level, disputed, title FROM records WHERE status != 'removed' ORDER BY (status = 'pending') DESC, created_at DESC")).rows;
  const flags = await listFlags(db, actor);
  const byId = new Map(records.map((r) => [r.id, r]));
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}><h1>Reviewer console</h1><form action={logoutAction}><button className="secondary">Sign out ({actor.name})</button></form></div>
      {sp.msg && <p className="notice" role="status">{sp.msg}</p>}

      <h2>Open reports ({flags.length})</h2>
      {flags.length === 0 ? <p className="muted">No open reports.</p> : flags.map((f) => (
        <form key={f.id} action={reviewFormAction} className="panel ui">
          <input type="hidden" name="action" value="resolveFlag" /><input type="hidden" name="recordId" value={f.record_id} /><input type="hidden" name="flagId" value={f.id} />
          <p><strong>{f.type.replace(/_/g, ' ')}</strong> on <a href={`/r/${f.record_id}`}>{f.title} ({f.record_id})</a></p>
          <p style={{ whiteSpace: 'pre-line' }}>{f.text}</p>{f.reporter_contact && <p className="muted">Reporter: {f.reporter_contact}</p>}
          <label htmlFor={`fn-${f.id}`}>Resolution note</label><textarea id={`fn-${f.id}`} name="note" required />
          <p><button type="submit">Resolve report</button></p>
        </form>))}

      <h2>Records ({rows.length})</h2>
      {rows.map((r) => (
        <section key={r.id} className="panel ui" aria-label={r.title}>
          <h3><a href={`/r/${r.id}`}>{r.title}</a> <span className="muted">({r.id})</span></h3>
          <ul className="chips"><li className="chip">{String(r.status).replace('_', ' ')}</li><li className="chip">{r.verification_level}</li>{r.disputed ? <li className="chip ask">open report</li> : null}</ul>
          <form action={reviewFormAction}>
            <input type="hidden" name="recordId" value={r.id} />
            <label htmlFor={`n-${r.id}`}>Note (optional for approve; used by “request changes”)</label><input id={`n-${r.id}`} type="text" name="note" />
            <p style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button name="action" value="approve">Approve</button>
              <button name="action" value="needsChanges" className="secondary">Request changes</button>
              <button name="action" value="remove" className="danger">Remove</button>
            </p>
          </form>
          <details><summary>Verify with evidence</summary>
            <form action={reviewFormAction}>
              <input type="hidden" name="recordId" value={r.id} /><input type="hidden" name="action" value="verify" />
              <label htmlFor={`s-${r.id}`}>Evidence source</label><input id={`s-${r.id}`} type="text" name="source" required />
              <label htmlFor={`u-${r.id}`}>URL (optional)</label><input id={`u-${r.id}`} type="url" name="url" />
              <label htmlFor={`e-${r.id}`}>Evidence note</label><textarea id={`e-${r.id}`} name="note" required />
              <p><button type="submit">Mark verified</button></p>
            </form></details>
        </section>))}
      {byId.size === 0 && <p className="muted">No records yet.</p>}
    </>
  );
}
