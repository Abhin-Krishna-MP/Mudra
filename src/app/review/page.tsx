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

import './signin.css';
import './review.css';

import LoginForm from './LoginForm';
import RequestsSection from './RequestsSection';
import AddStewardSection from './AddStewardSection';
import RecordManagementCard, { RecordItem } from './RecordManagementCard';
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
  const isSteward = actor.role === 'steward';

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

  // Load all records with their asset IDs so thumbnails render
  const recordRows: RecordItem[] = (
    await db.execute(
      `SELECT
        r.id,
        r.status,
        r.verification_level,
        r.disputed,
        r.title,
        r.region,
        COALESCE(NULLIF(r.category, ''), r.work_type) as category,
        r.revision_note,
        r.created_at,
        a.id as asset_id,
        a.alt as asset_alt
      FROM records r
      LEFT JOIN assets a ON a.record_id = r.id
      WHERE r.status != 'removed'
      ORDER BY r.created_at DESC`,
    )
  ).rows.map((r) => ({
    id: String(r.id),
    status: String(r.status),
    verification_level: String(r.verification_level),
    disputed: Number(r.disputed),
    title: String(r.title),
    region: String(r.region),
    category: String(r.category),
    revision_note: String(r.revision_note || ''),
    asset_id: r.asset_id ? String(r.asset_id) : undefined,
    asset_alt: r.asset_alt ? String(r.asset_alt) : undefined,
  }));

  // Options for steward assignment dropdown
  const recordOptions = recordRows.map((r) => ({
    id: r.id,
    title: r.title,
    region: r.region,
    category: r.category,
    status: r.status,
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

  // Separate records into:
  // 1. Pending Verification / Review tasks:
  //    (status = 'pending' or disputed)
  const pendingRecords = isSteward
    ? recordRows.filter(
        (r) =>
          r.status === 'pending' &&
          (!stewardRegion || r.region === stewardRegion) &&
          (!stewardCategory || r.category === stewardCategory),
      )
    : recordRows.filter((r) => r.status === 'pending' || r.disputed === 1);

  // 2. Past Records (kept at last, matching image):
  const pastRecords = isSteward
    ? recordRows.filter((r) => r.status !== 'pending')
    : recordRows.filter((r) => r.status !== 'pending' && r.disputed !== 1);

  // Open permission requests count
  const openPermissionCount = requests.filter(
    (r) => r.status === 'open' || r.status === 'forwarded',
  ).length;

  return (
    <div className="wrap page review-console-page">
      <PageSheet
        title={isSteward ? 'Steward Dashboard' : 'Reviewer console'}
        lede={
          isSteward
            ? `Signed in as Steward ${actor.name} (${stewardRegion || 'All Regions'} · ${stewardCategory || 'All Categories'})`
            : `Signed in as ${actor.name}.`
        }
        headExtra={
          <form action={logoutAction} className="sheet-action" style={{ margin: 0 }}>
            <button className="secondary signout-btn" type="submit">
              <Icon name="user" size={15} />
              <span>Sign out ({actor.name})</span>
            </button>
          </form>
        }
      >
        {/* Status Alert Banner (e.g. Done.) */}
        {sp.msg && (
          <div className="rc-alert-done" role="status">
            <Icon name="checkCircle" size={18} />
            <span>{sp.msg}</span>
          </div>
        )}

          {/* Steward routing note if active */}
          {isSteward && (
            <div className="sb-callout" style={{ marginBottom: 20 }}>
              <p>
                <strong>Steward Tag Matching Routing Active:</strong> You are viewing records & requests routed to your expertise in{' '}
                <strong>{stewardRegion || 'All Regions'}</strong> and <strong>{stewardCategory || 'All Categories'}</strong>.
              </p>
            </div>
          )}

          {/* 4. Top Overview Stats Cards (Matching user image) */}
          <div className="rc-stats-row">
            <div className="rc-stat-card">
              <div className="rc-stat-icon">
                <Icon name="file" size={22} />
              </div>
              <div className="rc-stat-mid">
                <span className="rc-stat-label">Open Reports</span>
                <span className="rc-stat-num">{flags.length}</span>
              </div>
              <div className="rc-stat-divider" />
              <div className="rc-stat-text">
                {flags.length === 0 ? 'No open reports.' : `${flags.length} open report(s)`}
              </div>
            </div>

            <div className="rc-stat-card">
              <div className="rc-stat-icon">
                <Icon name="users" size={22} />
              </div>
              <div className="rc-stat-mid">
                <span className="rc-stat-label">Permission Requests</span>
                <span className="rc-stat-num">{openPermissionCount}</span>
              </div>
              <div className="rc-stat-divider" />
              <div className="rc-stat-text">
                {openPermissionCount === 0 ? 'No open requests at this time.' : `${openPermissionCount} open request(s)`}
              </div>
            </div>
          </div>

          {/* 5. SEPARATE SECTION: Ask First Requests (Permission Requests & Past Requests) */}
          <RequestsSection requests={requests} stewards={users} />

          {/* 6. SEPARATE SECTION: Verify Requests & Open Reports */}
          {(pendingRecords.length > 0 || flags.length > 0) && (
            <section style={{ marginTop: 28 }}>
              <h2 className="rc-section-heading">
                <Icon name="shield" size={22} />
                <span>Verification Requests ({pendingRecords.length + flags.length})</span>
              </h2>

              {/* Open reports resolution */}
              {flags.map((f) => (
                <form
                  key={f.id}
                  action={reviewFormAction}
                  className="panel ui"
                  style={{ marginBottom: 16 }}
                >
                  <input type="hidden" name="action" value="resolveFlag" />
                  <input type="hidden" name="recordId" value={f.record_id} />
                  <input type="hidden" name="flagId" value={f.id} />

                  <p>
                    <strong>{f.type.replace(/_/g, ' ')}</strong> on{' '}
                    <a href={`/r/${f.record_id}`}>
                      {f.title} ({f.record_id})
                    </a>
                  </p>
                  <p style={{ whiteSpace: 'pre-line' }}>{f.text}</p>
                  {f.reporter_contact && (
                    <p className="muted" style={{ fontSize: '0.85rem' }}>
                      Reporter: {f.reporter_contact}
                    </p>
                  )}

                  <label htmlFor={`fn-${f.id}`} style={{ fontWeight: 600 }}>
                    Resolution note
                  </label>
                  <textarea id={`fn-${f.id}`} name="note" required rows={2} />

                  <div className="btn-row" style={{ marginTop: 12 }}>
                    <button type="submit" className="btn pp-btn-maroon">
                      Resolve report
                    </button>
                  </div>
                </form>
              ))}

              {/* Pending records to verify */}
              {pendingRecords.map((r) => (
                <RecordManagementCard
                  key={r.id}
                  record={r}
                  linkedStewards={stewardsByRecord.get(String(r.id)) ?? []}
                  allStewards={users}
                />
              ))}
            </section>
          )}

          {/* 7. SEPARATE SECTION: Add / Assign Steward Section (Correct Light Theme styling) */}
          <AddStewardSection users={users} records={recordOptions} />

          {/* 8. SEPARATE SECTION: Past Records (Keep it at last, exactly as requested) */}
          <section style={{ marginTop: 32 }}>
            <h2 className="rc-section-heading">
              <Icon name="layers" size={22} />
              <span>Records ({pastRecords.length})</span>
            </h2>

            {pastRecords.length === 0 ? (
              <p className="muted">No published records to display.</p>
            ) : (
              pastRecords.map((r) => (
                <RecordManagementCard
                  key={r.id}
                  record={r}
                  linkedStewards={stewardsByRecord.get(String(r.id)) ?? []}
                  allStewards={users}
                />
              ))
            )}
          </section>
      </PageSheet>
    </div>
  );
}
