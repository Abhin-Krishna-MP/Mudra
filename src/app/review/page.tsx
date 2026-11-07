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

  // Load active records with their asset IDs so thumbnails render
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
        r.deleted_at,
        r.recycle_until,
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
    deleted_at: r.deleted_at ? String(r.deleted_at) : undefined,
    recycle_until: r.recycle_until ? String(r.recycle_until) : undefined,
  }));

  // Load 30-day recycle bin records (denied records)
  const recycleBinRows: RecordItem[] = (
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
        r.deleted_at,
        r.recycle_until,
        a.id as asset_id,
        a.alt as asset_alt
      FROM records r
      LEFT JOIN assets a ON a.record_id = r.id
      WHERE r.status = 'removed'
      ORDER BY r.deleted_at DESC, r.created_at DESC`,
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
    deleted_at: r.deleted_at ? String(r.deleted_at) : undefined,
    recycle_until: r.recycle_until ? String(r.recycle_until) : undefined,
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

  // Active records to moderate / verify:
  // Pending review, revision requested, or disputed records
  const pendingRecords = isSteward
    ? recordRows.filter(
        (r) =>
          r.status === 'pending' &&
          (!stewardRegion || r.region === stewardRegion) &&
          (!stewardCategory || r.category === stewardCategory),
      )
    : recordRows.filter((r) => r.status === 'pending' || r.status === 'needs_revision' || r.disputed === 1);

  // Past / published records (already in catalogue)
  const pastRecords = isSteward
    ? recordRows.filter((r) => r.status !== 'pending' && r.status !== 'needs_revision')
    : recordRows.filter((r) => r.status !== 'pending' && r.status !== 'needs_revision' && r.disputed !== 1);

  // Open permission requests count
  const openPermissionCount = requests.filter(
    (r) => r.status === 'open' || r.status === 'forwarded',
  ).length;

  // Clean notice message (User Request: "Remove done in reviewer console")
  const showNotice = sp.msg && !/^done\.?$/i.test(sp.msg.trim());

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
        {/* Informative alert banner if present (and not "Done.") */}
        {showNotice && (
          <div className="rc-callout" role="status" style={{ marginBottom: 20 }}>
            <Icon name="info" size={18} />
            <span>{sp.msg}</span>
          </div>
        )}

        {/* Steward routing note if active */}
        {isSteward && (
          <div className="rc-callout" style={{ marginBottom: 20 }}>
            <Icon name="shield" size={18} />
            <div>
              <strong>Steward Tag Matching Routing Active:</strong> You are viewing records &amp; requests routed to your expertise in{' '}
              <strong>{stewardRegion || 'All Regions'}</strong> and <strong>{stewardCategory || 'All Categories'}</strong>.
            </div>
          </div>
        )}

        {/* Top Overview Stats Cards */}
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

        {/* =========================================================================
            SECTION 1: OPEN REPORTS
            ========================================================================= */}
        <section className="rc-section-block" aria-labelledby="heading-open-reports">
          <div className="rc-section-header-wrap">
            <h2 id="heading-open-reports" className="rc-section-heading" style={{ margin: 0 }}>
              <Icon name="alertCircle" size={22} />
              <span>Open Reports ({flags.length})</span>
            </h2>
            <span className="rc-section-tag reports">Reports &amp; Disputes</span>
          </div>

          {flags.length === 0 ? (
            <div className="rc-empty-card">
              <Icon name="checkCircle" size={18} />
              <span>No open community reports or copyright dispute flags. All records are clear.</span>
            </div>
          ) : (
            flags.map((f) => (
              <form
                key={f.id}
                action={reviewFormAction}
                className="rc-record-card"
                style={{ marginBottom: 16 }}
              >
                <input type="hidden" name="action" value="resolveFlag" />
                <input type="hidden" name="recordId" value={f.record_id} />
                <input type="hidden" name="flagId" value={f.id} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
                  <p style={{ margin: 0 }}>
                    <strong>{f.type.replace(/_/g, ' ')}</strong> on{' '}
                    <a href={`/r/${f.record_id}`} style={{ color: 'var(--rc-maroon, #751b16)', fontWeight: 600 }}>
                      {f.title} ({f.record_id})
                    </a>
                  </p>
                  <span className="chip ask">Flagged</span>
                </div>

                <p style={{ whiteSpace: 'pre-line', margin: '10px 0' }}>{f.text}</p>
                {f.reporter_contact && (
                  <p className="muted" style={{ fontSize: '0.85rem', margin: '0 0 10px' }}>
                    Reporter: {f.reporter_contact}
                  </p>
                )}

                <label htmlFor={`fn-${f.id}`} className="rc-edit-note-label">
                  <Icon name="quote" size={15} />
                  <span>Resolution note</span>
                </label>
                <textarea id={`fn-${f.id}`} name="note" required rows={2} className="rc-edit-note-input" style={{ minHeight: 60 }} />

                <div className="btn-row" style={{ marginTop: 12 }}>
                  <button type="submit" className="btn pp-btn-maroon">
                    <Icon name="check" size={15} /> Resolve Report
                  </button>
                </div>
              </form>
            ))
          )}
        </section>

        {/* =========================================================================
            SECTION 2: PERMISSION REQUESTS
            ========================================================================= */}
        <section className="rc-section-block" aria-labelledby="heading-permissions">
          <div className="rc-section-header-wrap">
            <h2 id="heading-permissions" className="rc-section-heading" style={{ margin: 0 }}>
              <Icon name="users" size={22} />
              <span>Permission Requests ({openPermissionCount} Active)</span>
            </h2>
            <span className="rc-section-tag requests">Ask First System</span>
          </div>

          <RequestsSection requests={requests} stewards={users} />
        </section>

        {/* =========================================================================
            SECTION 3: SYSTEM STEWARDS
            ========================================================================= */}
        <section className="rc-section-block" aria-labelledby="heading-stewards">
          <div className="rc-section-header-wrap">
            <h2 id="heading-stewards" className="rc-section-heading" style={{ margin: 0 }}>
              <Icon name="shield" size={22} />
              <span>System Stewards</span>
            </h2>
            <span className="rc-section-tag stewards">Community Governance</span>
          </div>

          <AddStewardSection users={users} records={recordOptions} />
        </section>

        {/* =========================================================================
            SECTION 4: ACTIVE RECORDS (PENDING REVIEW / VERIFICATION)
            ========================================================================= */}
        <section className="rc-section-block" aria-labelledby="heading-records">
          <div className="rc-section-header-wrap">
            <h2 id="heading-records" className="rc-section-heading" style={{ margin: 0 }}>
              <Icon name="layers" size={22} />
              <span>Active Records ({pendingRecords.length})</span>
            </h2>
            <span className="rc-section-tag records">Moderation &amp; Verification</span>
          </div>

          {pendingRecords.length === 0 ? (
            <div className="rc-empty-card">
              <Icon name="checkCircle" size={18} />
              <span>No records currently awaiting moderation or verification. All submitted works are processed!</span>
            </div>
          ) : (
            pendingRecords.map((r) => (
              <RecordManagementCard
                key={r.id}
                record={r}
                linkedStewards={stewardsByRecord.get(String(r.id)) ?? []}
                allStewards={users}
              />
            ))
          )}
        </section>

        {/* =========================================================================
            SECTION 5: PAST RECORDS & 30-DAY RECYCLE BIN
            ========================================================================= */}
        <section className="rc-section-block" aria-labelledby="heading-archives">
          <div className="rc-section-header-wrap">
            <h2 id="heading-archives" className="rc-section-heading" style={{ margin: 0 }}>
              <Icon name="archive" size={22} />
              <span>Past Records &amp; Recycle Bin</span>
            </h2>
            <span className="rc-section-tag past">Archives</span>
          </div>

          {/* 30-day Recycle Bin for Denied Records */}
          {recycleBinRows.length > 0 && (
            <details
              className="rc-record-card"
              style={{
                marginBottom: 16,
                borderColor: '#fca5a5',
                background: 'rgba(254, 242, 242, 0.4)',
              }}
            >
              <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: '1rem', color: '#991b1b', outline: 'none' }}>
                Recycle Bin ({recycleBinRows.length} Denied Records — Retained for 30 Days)
              </summary>
              <div style={{ marginTop: 14 }}>
                <p style={{ fontSize: '0.88rem', color: 'var(--rc-muted)', marginBottom: 14 }}>
                  Denied records are preserved in the 30-day recycle bin before permanent deletion. You may restore any record back to active review at any time.
                </p>
                {recycleBinRows.map((r) => (
                  <RecordManagementCard
                    key={r.id}
                    record={r}
                    linkedStewards={stewardsByRecord.get(String(r.id)) ?? []}
                    allStewards={users}
                  />
                ))}
              </div>
            </details>
          )}

          {/* Published Catalogue Records Archive */}
          <details
            className="rc-record-card"
            style={{ marginBottom: 16 }}
            open={pendingRecords.length === 0}
          >
            <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: '1rem', color: 'var(--rc-ink)', outline: 'none' }}>
              Published Catalogue Records ({pastRecords.length})
            </summary>
            <div style={{ marginTop: 14 }}>
              {pastRecords.length === 0 ? (
                <p className="muted">No published catalogue records to display.</p>
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
            </div>
          </details>
        </section>
      </PageSheet>
    </div>
  );
}
