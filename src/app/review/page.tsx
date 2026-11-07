import { getDb } from '@/lib/db';
import { getActor } from '@/lib/session';
import { listRecords, listFlags } from '@/lib/repo';
import { listRequestsForSteward } from '@/lib/repo-grants';
import { reviewFormAction, logoutAction, assignStewardAction } from '@/app/actions';
import '../reuse/reuse.css';
import './signin.css';
import LoginForm from './LoginForm';
import RequestsSection from './RequestsSection';
import { PageSheet } from '@/components/PageSheet';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Reviewer console' };

export default async function Review({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const sp = await searchParams;
  const actor = await getActor();
  if (!actor || !['reviewer', 'admin', 'steward'].includes(actor.role)) return (<div className="wrap page reuse-page signin-page"><PageSheet eyebrow="Reviewer & Steward Access" title="Steward & Reviewer Sign-In" lede="For stewards and reviewers only."><LoginForm /></PageSheet></div>);
  const db = await getDb();
  const records = await listRecords(db, { reviewer: true });

  // Look up current steward's expertise region & category
  const stewardUser = actor.id
    ? (await db.execute('SELECT id, region, category FROM users WHERE id = ?', [actor.id])).rows[0]
    : (await db.execute('SELECT id, region, category FROM users WHERE name = ?', [actor.name])).rows[0];
  const stewardRegion = String(stewardUser?.region || '').trim();
  const stewardCategory = String(stewardUser?.category || '').trim();

  // Step 2 Requirement: Specific Steward Routing (Tag Matching)
  // When a Steward loads their dashboard, do not fetch all pending drafts.
  // Instead, apply a database filter so they only see drafts where status is pending,
  // region exactly matches steward's region, and category exactly matches steward's category.
  const isSteward = actor.role === 'steward';
  let rows;
  if (isSteward) {
    rows = (await db.execute(
      `SELECT id, status, verification_level, disputed, title, region, COALESCE(NULLIF(category, ''), work_type) as category, revision_note
       FROM records
       WHERE status = 'pending' AND region = ? AND (category = ? OR work_type = ?)
       ORDER BY created_at DESC`,
      [stewardRegion, stewardCategory, stewardCategory],
    )).rows;
  } else {
    rows = (await db.execute(
      "SELECT id, status, verification_level, disputed, title, region, COALESCE(NULLIF(category, ''), work_type) as category, revision_note FROM records WHERE status != 'removed' ORDER BY (status = 'pending') DESC, created_at DESC"
    )).rows;
  }

  const flags = await listFlags(db, actor);
  const requests = await listRequestsForSteward(db, actor);
  const users = (await db.execute("SELECT id, name, email FROM users ORDER BY name")).rows.map((u) => ({ id: Number(u.id), name: String(u.name), email: String(u.email) }));
  const stewardRows = (await db.execute("SELECT rs.record_id, u.id as user_id, u.name FROM record_stewards rs JOIN users u ON u.id = rs.user_id")).rows;
  const stewardsByRecord = new Map<string, Array<{ id: number; name: string }>>();
  for (const s of stewardRows) {
    const list = stewardsByRecord.get(String(s.record_id)) ?? [];
    list.push({ id: Number(s.user_id), name: String(s.name) });
    stewardsByRecord.set(String(s.record_id), list);
  }
  const byId = new Map(records.map((r) => [r.id, r]));
  return (
    <div className="wrap page"><PageSheet title={isSteward ? "Steward Dashboard" : "Reviewer console"} lede={isSteward ? `Signed in as Steward ${actor.name} (Assigned Region: ${stewardRegion || 'Any'} · Category: ${stewardCategory || 'Any'})` : `Signed in as ${actor.name}.`} headExtra={<form action={logoutAction} className="sheet-action" style={{ margin: 0 }}><button type="submit" className="btn secondary">Sign out ({actor.name})</button></form>}>
      {sp.msg && <p className="notice" role="status">{sp.msg}</p>}

      {isSteward && (
        <div className="sb-callout" style={{ marginBottom: 20 }}>
          <p>
            <strong>Steward Tag Matching Routing Active:</strong> You are viewing pending drafts automatically routed to your expertise in <strong>{stewardRegion || 'All Regions'}</strong> and <strong>{stewardCategory || 'All Categories'}</strong>.
          </p>
        </div>
      )}

      {!isSteward && (
        <>
          <h2 style={{ marginTop: 0 }}>Open reports ({flags.length})</h2>
          {flags.length === 0 ? <p className="muted">No open reports.</p> : flags.map((f) => (
            <form key={f.id} action={reviewFormAction} className="panel ui">
              <input type="hidden" name="action" value="resolveFlag" /><input type="hidden" name="recordId" value={f.record_id} /><input type="hidden" name="flagId" value={f.id} />
              <p><strong>{f.type.replace(/_/g, ' ')}</strong> on <a href={`/r/${f.record_id}`}>{f.title} ({f.record_id})</a></p>
              <p style={{ whiteSpace: 'pre-line' }}>{f.text}</p>{f.reporter_contact && <p className="muted">Reporter: {f.reporter_contact}</p>}
              <label htmlFor={`fn-${f.id}`}>Resolution note</label><textarea id={`fn-${f.id}`} name="note" required />
              <div className="btn-row" style={{ marginTop: 14 }}><button type="submit">Resolve report</button></div>
            </form>))}

          <RequestsSection requests={requests} />
        </>
      )}

      <h2>{isSteward ? `Pending Drafts Matching Your Expertise (${rows.length})` : `Records (${rows.length})`}</h2>
      {rows.length === 0 && <p className="muted">No pending drafts matching your region and category.</p>}
      {rows.map((r) => {
        const linkedStewards = stewardsByRecord.get(r.id) ?? [];
        return (
        <section key={r.id} className="panel ui" aria-label={r.title}>
          <h3><a href={`/r/${r.id}`}>{r.title}</a> <span className="muted">({r.id})</span></h3>
          <ul className="chips">
            <li className="chip">{String(r.status).replace('_', ' ')}</li>
            <li className="chip">{r.region}</li>
            <li className="chip">{r.category}</li>
            <li className="chip">{r.verification_level}</li>
            {r.disputed ? <li className="chip ask">open report</li> : null}
            {linkedStewards.length > 0 ? <li className="chip verified">Steward: {linkedStewards.map((s) => s.name).join(', ')}</li> : <li className="chip">No steward</li>}
          </ul>

          {r.revision_note && (
            <div className="sb-callout" style={{ margin: '10px 0' }}>
              <strong>Current Revision Note:</strong> {r.revision_note}
            </div>
          )}

          <form action={reviewFormAction}>
            <input type="hidden" name="recordId" value={r.id} />
            <label htmlFor={`n-${r.id}`}>Required edits or reviewer note (required when requesting revision)</label>
            <input id={`n-${r.id}`} type="text" name="note" placeholder="Describe edits for author (e.g. Please verify tradition lineage)..." />
            <div className="btn-row" style={{ marginTop: 14 }}>
              <button name="action" value="approve">Approve</button>
              {/* Step 5 Requirement: Request Revision button alongside Approve/Deny buttons */}
              <button name="action" value="requestRevision" className="secondary">Request Revision</button>
              <button name="action" value="remove" className="danger">Deny</button>
            </div>
          </form>
          <details className="evidence"><summary>Verify with evidence</summary>
            <form action={reviewFormAction}>
              <input type="hidden" name="recordId" value={r.id} /><input type="hidden" name="action" value="verify" />
              <label htmlFor={`s-${r.id}`}>Evidence source</label><input id={`s-${r.id}`} type="text" name="source" required />
              <label htmlFor={`u-${r.id}`}>URL (optional)</label><input id={`u-${r.id}`} type="url" name="url" />
              <label htmlFor={`e-${r.id}`}>Evidence note</label><textarea id={`e-${r.id}`} name="note" required />
              <div className="btn-row"><button type="submit">Mark verified</button></div>
            </form></details>
          <details className="evidence" style={{ marginTop: 8 }}><summary>Assign steward</summary>
            <form action={assignStewardAction} style={{ marginTop: 8 }}>
              <input type="hidden" name="recordId" value={r.id} />
              <label htmlFor={`u-sel-${r.id}`}>Select reviewer / steward to link</label>
              <select id={`u-sel-${r.id}`} name="userId">
                {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
              </select>
              <div className="btn-row" style={{ marginTop: 8 }}>
                <button type="submit" className="secondary">Link as steward</button>
              </div>
            </form></details>
        </section>);
      })}
      {rows.length === 0 && <p className="muted">No records to display.</p>}
    </PageSheet></div>
  );
}
