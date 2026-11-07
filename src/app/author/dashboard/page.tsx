import { redirect } from 'next/navigation';
import { getActor } from '@/lib/session';
import { getDb } from '@/lib/db';
import { listDraftsForAuthor } from '@/lib/repo';
import { PageSheet } from '@/components/PageSheet';
import { Icon } from '@/components/Icons';
import { logoutAction } from '@/app/actions';
import '../../reuse/reuse.css';

export const metadata = { title: 'Author Dashboard' };

export default async function AuthorDashboard({
  searchParams,
}: {
  searchParams: Promise<{ resubmitted?: string; msg?: string }>;
}) {
  const actor = await getActor();
  if (!actor || !actor.id) {
    redirect('/login?error=Unauthorized&redirect=/author/dashboard');
  }

  const sp = await searchParams;
  const db = await getDb();
  const drafts = await listDraftsForAuthor(db, actor.id);

  // Separate drafts flagged as needs_revision
  const needsRevision = drafts.filter((d) => d.status === 'needs_revision');
  const others = drafts.filter((d) => d.status !== 'needs_revision');

  return (
    <div className="wrap page">
      <PageSheet
        title="Author Dashboard"
        lede={`Signed in as ${actor.name} (${actor.role}). Manage your cultural submissions and revisions.`}
        headExtra={
          <div style={{ display: 'flex', gap: 8 }}>
            <a href="/submit" className="btn">Submit New Work</a>
            <a href="/apply-steward" className="btn secondary">Apply as Steward</a>
            <form action={logoutAction}>
              <button type="submit" className="secondary">Sign out</button>
            </form>
          </div>
        }
      >
        {sp.resubmitted && (
          <div className="notice" role="status" style={{ marginBottom: 20 }}>
            Draft <strong>{sp.resubmitted}</strong> was updated and resubmitted. Status reset to <strong>pending</strong> for steward review.
          </div>
        )}
        {sp.msg && <p className="notice" role="status">{sp.msg}</p>}

        {/* Step 5 Requirement: Prominently display any draft flagged as needs_revision */}
        {needsRevision.length > 0 && (
          <section aria-labelledby="revisions-heading" style={{ marginBottom: 32 }}>
            <div style={{
              background: 'var(--red-tint, rgba(239, 68, 68, 0.08))',
              border: '1.5px solid var(--red, #ef4444)',
              borderRadius: 12,
              padding: 20,
            }}>
              <h2 id="revisions-heading" style={{ color: 'var(--red, #ef4444)', marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="info" size={24} />
                Action Required: Revisions Requested ({needsRevision.length})
              </h2>
              <p>The regional steward has reviewed the following drafts and requested specific edits:</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
                {needsRevision.map((d) => (
                  <article key={d.id} className="panel ui" style={{ background: 'var(--bg-card, #ffffff)', borderColor: 'var(--red, #ef4444)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <h3 style={{ margin: '0 0 6px 0' }}>{d.title}</h3>
                        <ul className="chips" style={{ marginBottom: 8 }}>
                          <li className="chip danger">needs revision</li>
                          <li className="chip">{d.region}</li>
                          <li className="chip">{d.category}</li>
                          <li className="chip muted">{d.id}</li>
                        </ul>
                      </div>
                      {/* Step 5 Requirement: Provide an "Edit" button that re-opens their original form */}
                      <a href={`/submit?edit=${encodeURIComponent(d.id)}`} className="btn">
                        <Icon name="tools" size={16} /> Edit & Resubmit
                      </a>
                    </div>

                    <div className="sb-callout" style={{ marginTop: 12, background: 'rgba(239, 68, 68, 0.05)' }}>
                      <p><strong>Steward’s Revision Note:</strong></p>
                      <blockquote style={{ margin: '6px 0 0 0', fontStyle: 'italic', whiteSpace: 'pre-line' }}>
                        “{d.revisionNote || 'Please update the requested details in the form.'}”
                      </blockquote>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        <h2>Your Submissions ({others.length})</h2>
        {others.length === 0 && needsRevision.length === 0 ? (
          <div className="panel ui" style={{ textAlign: 'center', padding: '32px 16px' }}>
            <p className="muted">You haven’t submitted any cultural works yet.</p>
            <p><a href="/submit" className="btn" style={{ marginTop: 12 }}>Submit Your First Record</a></p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {others.map((d) => (
              <section key={d.id} className="panel ui" aria-label={d.title}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <h3 style={{ margin: 0 }}>
                      <a href={d.status === 'published' ? `/r/${d.id}` : '#'}>{d.title}</a>
                      <span className="muted"> ({d.id})</span>
                    </h3>
                    <ul className="chips" style={{ marginTop: 6 }}>
                      <li className={`chip ${d.status === 'published' ? 'verified' : ''}`}>
                        {String(d.status).replace('_', ' ')}
                      </li>
                      <li className="chip">{d.region}</li>
                      <li className="chip">{d.category}</li>
                      <li className="chip muted">{new Date(d.createdAt).toLocaleDateString()}</li>
                    </ul>
                  </div>
                  {d.status === 'published' && (
                    <a href={`/r/${d.id}`} className="btn secondary">View in Catalogue</a>
                  )}
                  {d.status === 'pending' && (
                    <span className="chip ask">Under Steward Review</span>
                  )}
                </div>
              </section>
            ))}
          </div>
        )}
      </PageSheet>
    </div>
  );
}
