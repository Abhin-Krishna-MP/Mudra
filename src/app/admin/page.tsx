import { notFound, redirect } from 'next/navigation';
import { getActor } from '@/lib/session';
import { getDb } from '@/lib/db';
import { PageSheet } from '@/components/PageSheet';
import { Icon } from '@/components/Icons';
import { approveStewardAction, rejectStewardAction, logoutAction } from '@/app/actions';
import '../reuse/reuse.css';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin Stewardship Console' };

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string }>;
}) {
  const actor = await getActor();
  if (!actor) {
    redirect('/login?error=Unauthorized&redirect=/admin');
  }
  // Hidden admin dashboard: non-admins receive a 404
  if (actor.role !== 'admin') {
    notFound();
  }

  const sp = await searchParams;
  const db = await getDb();

  // Step 3: Review pending applications
  const pendingApps = (await db.execute(
    `SELECT sa.id, sa.user_id, sa.id_document_url, sa.region, sa.category, sa.status, sa.created_at,
            u.name as user_name, u.email as user_email, u.role as current_role
     FROM steward_applications sa
     JOIN users u ON u.id = sa.user_id
     WHERE sa.status = 'pending'
     ORDER BY sa.created_at ASC`,
  )).rows;

  // Active stewards
  const activeStewards = (await db.execute(
    `SELECT id, name, email, role, region, category FROM users WHERE role = 'steward' ORDER BY name ASC`,
  )).rows;

  return (
    <div className="wrap page">
      <PageSheet
        eyebrow="Admin Console"
        title="Steward KYC & Verification Dashboard"
        lede={`Signed in as Admin (${actor.name}). Review identity submissions and approve community stewards.`}
        headExtra={
          <form action={logoutAction} className="sheet-action">
            <button className="secondary">Sign out ({actor.name})</button>
          </form>
        }
      >
        {sp.msg && <p className="notice" role="status" style={{ marginBottom: 20 }}>{sp.msg}</p>}

        <h2>Pending Steward Applications ({pendingApps.length})</h2>
        {pendingApps.length === 0 ? (
          <p className="muted">No pending steward verification applications.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {pendingApps.map((app) => (
              <section key={app.id} className="panel ui" aria-label={`Application from ${app.user_name}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h3 style={{ margin: '0 0 6px 0' }}>{app.user_name}</h3>
                    <p style={{ margin: 0 }} className="muted">Email: {app.user_email} · Current Role: {app.current_role}</p>
                    <ul className="chips" style={{ marginTop: 8 }}>
                      <li className="chip">Target Region: <strong>{app.region || 'All'}</strong></li>
                      <li className="chip">Target Category: <strong>{app.category || 'All'}</strong></li>
                      <li className="chip ask">Status: {app.status}</li>
                      <li className="chip muted">Applied: {new Date(app.created_at).toLocaleDateString()}</li>
                    </ul>
                  </div>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Secure link to ID document */}
                    <a
                      href={`/api/admin/kyc-document/${app.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn secondary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <Icon name="search" size={16} /> View ID Document (Secure)
                    </a>

                    {/* Step 3: Admin Approval button changes applicant's role in users table to steward */}
                    <form action={approveStewardAction} style={{ display: 'inline' }}>
                      <input type="hidden" name="applicationId" value={app.id} />
                      <button type="submit" className="btn">
                        <Icon name="check" size={16} /> Approve as Steward
                      </button>
                    </form>

                    <form action={rejectStewardAction} style={{ display: 'inline' }}>
                      <input type="hidden" name="applicationId" value={app.id} />
                      <button type="submit" className="btn danger">
                        Reject
                      </button>
                    </form>
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}

        <h2 style={{ marginTop: 40 }}>Active Community Stewards ({activeStewards.length})</h2>
        {activeStewards.length === 0 ? (
          <p className="muted">No approved stewards yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {activeStewards.map((steward) => (
              <div key={steward.id} className="panel ui" style={{ padding: 16 }}>
                <h4 style={{ margin: '0 0 4px 0' }}>{steward.name}</h4>
                <p className="muted" style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}>{steward.email}</p>
                <ul className="chips">
                  <li className="chip verified">Steward</li>
                  <li className="chip">{steward.region || 'All Regions'}</li>
                  <li className="chip">{steward.category || 'All Categories'}</li>
                </ul>
              </div>
            ))}
          </div>
        )}
      </PageSheet>
    </div>
  );
}
