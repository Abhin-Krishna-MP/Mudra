import type { RequestView } from '@/lib/repo-grants';
import { grantDecisionAction, revokeGrantAction } from '@/app/actions';

interface Props {
  requests: RequestView[];
}

export default function RequestsSection({ requests }: Props) {
  const openReqs = requests.filter((r) => r.status === 'open');
  const pastReqs = requests.filter((r) => r.status !== 'open');

  const today = new Date().toISOString().split('T')[0];

  return (
    <section aria-labelledby="reqs-heading" style={{ marginTop: 32 }}>
      <h2 id="reqs-heading">Permission Requests ({openReqs.length} open)</h2>
      {openReqs.length === 0 ? (
        <p className="muted">No open requests at this time.</p>
      ) : (
        openReqs.map((r) => (
          <div key={r.id} className="panel ui" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
              <h3 style={{ margin: 0 }}>
                Request for <a href={`/r/${r.record_id}`}>{r.record_id}</a>
              </h3>
              <span className="chip ask">Status: {r.status}</span>
            </div>

            <p style={{ margin: '8px 0 4px' }}>
              <strong>From:</strong> {r.requester_name} · <strong>Purpose:</strong> {r.use_key.replace(/_/g, ' ')}
            </p>
            <p style={{ margin: '4px 0' }}>
              <strong>What:</strong> {r.scope?.whatYouWillMake || '—'}
            </p>
            <p style={{ margin: '4px 0' }}>
              <strong>Where & duration:</strong> {r.scope?.whereAndHowLong || '—'}
            </p>
            <p className="muted" style={{ margin: '4px 0 16px', fontSize: '0.85rem' }}>
              Submitted: {new Date(r.created_at).toLocaleString('en-IN')}
            </p>

            <details className="evidence" open style={{ marginTop: 12 }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Decide request</summary>
              <form action={grantDecisionAction} style={{ marginTop: 12 }}>
                <input type="hidden" name="requestId" value={r.id} />

                <label htmlFor={`cond-${r.id}`}>Conditions (one per line, optional)</label>
                <textarea
                  id={`cond-${r.id}`}
                  name="conditions"
                  rows={2}
                  placeholder="e.g. Credit must accompany every print&#10;Limited run of 500 copies"
                />

                <label htmlFor={`credit-${r.id}`}>Required credit line (optional)</label>
                <input
                  id={`credit-${r.id}`}
                  type="text"
                  name="creditText"
                  placeholder="e.g. Courtesy of the Community Custodians via Mudra"
                />

                <div className="two" style={{ marginTop: 8 }}>
                  <div>
                    <label htmlFor={`vf-${r.id}`}>Valid from</label>
                    <input id={`vf-${r.id}`} type="date" name="validFrom" defaultValue={today} required />
                  </div>
                  <div>
                    <label htmlFor={`vu-${r.id}`}>Valid until (optional)</label>
                    <input id={`vu-${r.id}`} type="date" name="validUntil" />
                  </div>
                </div>

                <label htmlFor={`note-${r.id}`}>Decision note (optional for grant; required if declining)</label>
                <input
                  id={`note-${r.id}`}
                  type="text"
                  name="note"
                  placeholder="Note to requester"
                />

                <div className="btn-row" style={{ marginTop: 16 }}>
                  <button type="submit" name="decision" value="granted">Grant permission & issue signed grant</button>
                  <button type="submit" name="decision" value="declined" className="secondary">Decline request</button>
                </div>
              </form>
            </details>
          </div>
        ))
      )}

      {pastReqs.length > 0 && (
        <details className="panel" style={{ marginTop: 24 }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Past requests ({pastReqs.length})</summary>
          <div style={{ marginTop: 14 }}>
            {pastReqs.map((r) => (
              <div key={r.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ margin: 0 }}>
                    <strong>{r.record_id}</strong> — {r.requester_name} ({r.use_key.replace(/_/g, ' ')})
                  </p>
                  <span className={`chip ${r.status === 'granted' ? 'verified' : 'ask'}`}>{r.status}</span>
                </div>
                {r.decision_note && <p className="muted" style={{ margin: '4px 0' }}>Note: {r.decision_note}</p>}
                {r.grantId && (
                  <p style={{ margin: '6px 0 0' }}>
                    <a href={`/g/${r.grantId}`} style={{ fontWeight: 600 }}>View signed grant →</a>
                  </p>
                )}
                {r.status === 'granted' && (
                  <form action={revokeGrantAction} style={{ marginTop: 8 }}>
                    <input type="hidden" name="requestId" value={r.id} />
                    <input type="hidden" name="note" value="Revoked by reviewer in console" />
                    <button type="submit" className="danger" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
                      Revoke grant
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        </details>
      )}
    </section>
  );
}
