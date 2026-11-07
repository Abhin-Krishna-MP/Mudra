
import { getDb } from '@/lib/db';
import { getActor } from '@/lib/session';
import { listFlags } from '@/lib/repo';
import { listRequestsForSteward } from '@/lib/repo-grants';
import {
  reviewFormAction,
  logoutAction,
  assignStewardAction,
  unassignStewardAction,
} from '@/app/actions';

import '../reuse/reuse.css';
import './signin.css';

import LoginForm from './LoginForm';
import RequestsSection from './RequestsSection';
import AddStewardSection from './AddStewardSection';
import { PageSheet } from '@/components/PageSheet';
import { Icon } from '@/components/Icons';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Reviewer console' };

export default async function Review({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string }>;
}) {
  const sp = await searchParams;
  const actor = await getActor();

  if (!actor || !['reviewer', 'admin', 'steward'].includes(actor.role)) {
    return (
      <div className="wrap page reuse-page signin-page">
        <PageSheet
          eyebrow="Reviewer & Steward Access"
          title="Steward & Reviewer Sign-In"
          lede="For stewards and reviewers only."
        >
          <LoginForm />
        </PageSheet>
      </div>
    );
  }

  const db = await getDb();

  // Look up current steward's expertise region and category.
  const stewardUser = actor.id
    ? (
        await db.execute(
          'SELECT id, region, category FROM users WHERE id = ?',
          [actor.id],
        )
      ).rows[0]
    : (
        await db.execute(
          'SELECT id, region, category FROM users WHERE name = ?',
          [actor.name],
        )
      ).rows[0];

  const stewardRegion = String(stewardUser?.region || '').trim();
  const stewardCategory = String(stewardUser?.category || '').trim();

  // Specific Steward Routing (Tag Matching).
  // Stewards only see pending drafts matching their region and category.
  const isSteward = actor.role === 'steward';

  let rows;

  if (isSteward) {
    rows = (
      await db.execute(
        `SELECT
          id,
          status,
          verification_level,
          disputed,
          title,
          region,
          COALESCE(NULLIF(category, ''), work_type) as category,
          revision_note
        FROM records
        WHERE status = 'pending'
          AND region = ?
          AND (category = ? OR work_type = ?)
        ORDER BY created_at DESC`,
        [stewardRegion, stewardCategory, stewardCategory],
      )
    ).rows;
  } else {
    rows = (
      await db.execute(
        `SELECT
          id,
          status,
          verification_level,
          disputed,
          title,
          region,
          COALESCE(NULLIF(category, ''), work_type) as category,
          revision_note
        FROM records
        WHERE status != 'removed'
        ORDER BY (status = 'pending') DESC, created_at DESC`,
      )
    ).rows;
  }

  // Load dashboard data.
  const flags = await listFlags(db, actor);
  const requests = await listRequestsForSteward(db, actor);

  // Load users with roles and regions for steward assignment.
  const users = (
    await db.execute(
      "SELECT id, name, email, role, region, category FROM users ORDER BY (role = 'steward') DESC, (role = 'reviewer') DESC, name ASC",
    )
  ).rows.map((u) => ({
    id: Number(u.id),
    name: String(u.name),
    email: String(u.email),
    role: String(u.role),
    region: String(u.region || ''),
    category: String(u.category || ''),
  }));

  // Load active records for standalone steward management.
  const recordOptions = (
    await db.execute(
      "SELECT id, title, region, category, status FROM records WHERE status != 'removed' ORDER BY (status = 'pending') DESC, created_at DESC",
    )
  ).rows.map((rec) => ({
    id: String(rec.id),
    title: String(rec.title),
    region: String(rec.region || ''),
    category: String(rec.category || ''),
    status: String(rec.status),
  }));

  // Load currently assigned stewards.
  const stewardRows = (
    await db.execute(
      `SELECT
        rs.record_id,
        u.id as user_id,
        u.name
      FROM record_stewards rs
      JOIN users u ON u.id = rs.user_id`,
    )
  ).rows;

  const stewardsByRecord = new Map<
    string,
    Array<{ id: number; name: string }>
  >();

  for (const s of stewardRows) {
    const list = stewardsByRecord.get(String(s.record_id)) ?? [];

    list.push({
      id: Number(s.user_id),
      name: String(s.name),
    });

    stewardsByRecord.set(String(s.record_id), list);
  }

  return (
    <div className="wrap page">
      <PageSheet
        title={isSteward ? 'Steward Dashboard' : 'Reviewer console'}
        lede={
          isSteward
            ? `Signed in as Steward ${actor.name} (Assigned Region: ${
                stewardRegion || 'Any'
              } · Category: ${stewardCategory || 'Any'})`
            : `Signed in as ${actor.name}.`
        }
        headExtra={
          <form action={logoutAction} className="sheet-action">
            <button
              className="secondary signout-btn"
              type="submit"
            >
              <Icon name="user" size={15} />
              <span>Sign out ({actor.name})</span>
            </button>
          </form>
        }
      >
        {/* Status message */}
        {sp.msg && (
          <p className="notice" role="status">
            {sp.msg}
          </p>
        )}

        {/* Steward routing information */}
        {isSteward && (
          <div
            className="sb-callout"
            style={{ marginBottom: 20 }}
          >
            <p>
              <strong>
                Steward Tag Matching Routing Active:
              </strong>{' '}
              You are viewing pending drafts automatically routed to
              your expertise in{' '}
              <strong>
                {stewardRegion || 'All Regions'}
              </strong>{' '}
              and{' '}
              <strong>
                {stewardCategory || 'All Categories'}
              </strong>.
            </p>
          </div>
        )}

        {/* Reviewer and Admin sections */}
        {!isSteward && (
          <>
            {/* Open reports */}
            <h2 style={{ marginTop: 0 }}>
              Open reports ({flags.length})
            </h2>

            {flags.length === 0 ? (
              <p className="muted">No open reports.</p>
            ) : (
              flags.map((f) => (
                <form
                  key={f.id}
                  action={reviewFormAction}
                  className="panel ui"
                >
                  <input
                    type="hidden"
                    name="action"
                    value="resolveFlag"
                  />

                  <input
                    type="hidden"
                    name="recordId"
                    value={f.record_id}
                  />

                  <input
                    type="hidden"
                    name="flagId"
                    value={f.id}
                  />

                  <p>
                    <strong>
                      {f.type.replace(/_/g, ' ')}
                    </strong>{' '}
                    on{' '}
                    <a href={`/r/${f.record_id}`}>
                      {f.title} ({f.record_id})
                    </a>
                  </p>

                  <p style={{ whiteSpace: 'pre-line' }}>
                    {f.text}
                  </p>

                  {f.reporter_contact && (
                    <p className="muted">
                      Reporter: {f.reporter_contact}
                    </p>
                  )}

                  <label htmlFor={`fn-${f.id}`}>
                    Resolution note
                  </label>

                  <textarea
                    id={`fn-${f.id}`}
                    name="note"
                    required
                  />

                  <div
                    className="btn-row"
                    style={{ marginTop: 14 }}
                  >
                    <button type="submit">
                      Resolve report
                    </button>
                  </div>
                </form>
              ))
            )}

            {/* Steward requests */}
            <RequestsSection requests={requests} />
          </>
        )}

        {/* Dedicated Steward Management (Add / Assign Steward) */}
        <AddStewardSection users={users} records={recordOptions} />

        {/* Steward requests for active stewards */}
        {isSteward && requests.length > 0 && (
          <RequestsSection requests={requests} />
        )}

        {/* Records / Pending drafts */}
        <h2>
          {isSteward
            ? `Pending Drafts Matching Your Expertise (${rows.length})`
            : `Records (${rows.length})`}
        </h2>

        {rows.length === 0 && (
          <p className="muted">
            {isSteward
              ? 'No pending drafts matching your region and category.'
              : 'No records to display.'}
          </p>
        )}

        {rows.map((r) => {
          const linkedStewards =
            stewardsByRecord.get(String(r.id)) ?? [];

          return (
            <section
              key={r.id}
              className="panel ui"
              aria-label={r.title}
            >
              <h3>
                <a href={`/r/${r.id}`}>
                  {r.title}
                </a>{' '}
                <span className="muted">
                  ({r.id})
                </span>
              </h3>

              {/* Record information */}
              <ul className="chips">
                <li className="chip">
                  {String(r.status).replace('_', ' ')}
                </li>

                <li className="chip">
                  {r.region}
                </li>

                <li className="chip">
                  {r.category}
                </li>

                <li className="chip">
                  {r.verification_level}
                </li>

                {r.disputed ? (
                  <li className="chip ask">
                    open report
                  </li>
                ) : null}

                {linkedStewards.length > 0 ? (
                  <li className="chip verified" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <Icon name="shield" size={13} />
                    <span>Steward: {linkedStewards.map((s) => s.name).join(', ')}</span>
                  </li>
                ) : (
                  <li className="chip muted" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <Icon name="shield" size={13} />
                    <span>No steward</span>
                  </li>
                )}
              </ul>

              {linkedStewards.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, margin: '8px 0 12px' }}>
                  <span className="muted" style={{ fontSize: '0.8rem' }}>Assigned:</span>
                  {linkedStewards.map((s) => (
                    <form key={s.id} action={unassignStewardAction} style={{ display: 'inline', margin: 0 }}>
                      <input type="hidden" name="recordId" value={r.id} />
                      <input type="hidden" name="userId" value={s.id} />
                      <button
                        type="submit"
                        title={`Unlink ${s.name} from this record`}
                        className="chip"
                        style={{
                          cursor: 'pointer',
                          background: 'rgba(180, 40, 30, 0.15)',
                          borderColor: 'rgba(180, 40, 30, 0.35)',
                          color: '#e57373',
                          fontSize: '0.8rem',
                          padding: '2px 8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        {s.name} <span aria-hidden="true" style={{ fontWeight: 700 }}>✕</span>
                      </button>
                    </form>
                  ))}
                </div>
              )}

              {/* Revision note */}
              {r.revision_note && (
                <div
                  className="sb-callout"
                  style={{ margin: '10px 0' }}
                >
                  <strong>
                    Current Revision Note:
                  </strong>{' '}
                  {r.revision_note}
                </div>
              )}

              {/* Review actions */}
              <form action={reviewFormAction}>
                <input
                  type="hidden"
                  name="recordId"
                  value={r.id}
                />

                <label htmlFor={`n-${r.id}`}>
                  Required edits or reviewer note
                  (required when requesting revision)
                </label>

                <input
                  id={`n-${r.id}`}
                  type="text"
                  name="note"
                  placeholder="Describe edits for author (e.g. Please verify tradition lineage)..."
                />

                <div
                  className="btn-row"
                  style={{ marginTop: 14 }}
                >
                  <button
                    name="action"
                    value="approve"
                  >
                    Approve
                  </button>

                  <button
                    name="action"
                    value="requestRevision"
                    className="secondary"
                  >
                    Request Revision
                  </button>

                  <button
                    name="action"
                    value="remove"
                    className="danger"
                  >
                    Deny
                  </button>
                </div>
              </form>

              {/* Evidence verification */}
              <details className="evidence">
                <summary>
                  Verify with evidence
                </summary>

                <form action={reviewFormAction}>
                  <input
                    type="hidden"
                    name="recordId"
                    value={r.id}
                  />

                  <input
                    type="hidden"
                    name="action"
                    value="verify"
                  />

                  <label htmlFor={`s-${r.id}`}>
                    Evidence source
                  </label>

                  <input
                    id={`s-${r.id}`}
                    type="text"
                    name="source"
                    required
                  />

                  <label htmlFor={`u-${r.id}`}>
                    URL (optional)
                  </label>

                  <input
                    id={`u-${r.id}`}
                    type="url"
                    name="url"
                  />

                  <label htmlFor={`e-${r.id}`}>
                    Evidence note
                  </label>

                  <textarea
                    id={`e-${r.id}`}
                    name="note"
                    required
                  />

                  <div className="btn-row">
                    <button type="submit">
                      Mark verified
                    </button>
                  </div>
                </form>
              </details>
            </section>
          );
        })}
      </PageSheet>
    </div>
  );
}
