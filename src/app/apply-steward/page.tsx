import { redirect } from 'next/navigation';
import { getActor } from '@/lib/session';
import { getDb } from '@/lib/db';
import { PageSheet } from '@/components/PageSheet';
import { Icon } from '@/components/Icons';
import ApplyStewardForm from './ApplyStewardForm';
import '../reuse/reuse.css';

export const metadata = { title: 'Apply for Steward Verification' };

export default async function ApplyStewardPage({
  searchParams,
}: {
  searchParams: Promise<{ done?: string }>;
}) {
  const actor = await getActor();
  if (!actor || !actor.id) {
    redirect('/login?error=Unauthorized&redirect=/apply-steward');
  }

  const sp = await searchParams;
  const db = await getDb();

  // Get user details
  const user = (await db.execute('SELECT id, name, email, role, region, category FROM users WHERE id = ?', [actor.id])).rows[0];

  // Check for existing steward application
  const existingApp = (await db.execute(
    'SELECT * FROM steward_applications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
    [actor.id],
  )).rows[0];

  return (
    <div className="wrap page">
      <PageSheet
        eyebrow="Steward KYC Verification"
        title="Apply as Cultural Steward"
        lede="Authors can upload identity documents to become verified stewards for their region and cultural domain."
        headExtra={
          <div className="sheet-action">
            <a href="/author/dashboard" className="btn secondary">
              <Icon name="chevL" size={16} /> Back to Dashboard
            </a>
          </div>
        }
      >
        {sp.done && (
          <div className="sb-callout" role="alert" style={{ marginBottom: 24, borderLeft: '4px solid var(--accent, #047857)' }}>
            <Icon name="check" size={24} />
            <div>
              <strong>Application Submitted!</strong>
              <p>Your identity document has been securely stored. An administrator will review your application shortly.</p>
            </div>
          </div>
        )}

        {user?.role === 'steward' ? (
          <div className="panel ui" style={{ padding: 24 }}>
            <span className="chip verified" style={{ fontSize: '1rem', padding: '6px 12px' }}>
              <Icon name="shield" size={16} /> Verified Steward Active
            </span>
            <p style={{ marginTop: 12 }}>
              You are currently registered as a verified Steward for <strong>{user.region || 'Assigned Region'}</strong> ({user.category || 'All Categories'}).
            </p>
            <p><a href="/review" className="btn">Open Steward Dashboard</a></p>
          </div>
        ) : existingApp?.status === 'pending' ? (
          <div className="panel ui" style={{ padding: 24 }}>
            <span className="chip ask" style={{ fontSize: '1rem', padding: '6px 12px' }}>
              Pending Verification
            </span>
            <p style={{ marginTop: 12 }}>
              Your KYC document was submitted on <strong>{new Date(existingApp.created_at).toLocaleDateString()}</strong> for <strong>{existingApp.region}</strong> ({existingApp.category}) and is awaiting administrator approval.
            </p>
            <p className="muted">You will be notified once your role is upgraded to Steward.</p>
          </div>
        ) : (
          <ApplyStewardForm user={{ name: String(user?.name || actor.name), email: String(user?.email || '') }} />
        )}
      </PageSheet>
    </div>
  );
}
