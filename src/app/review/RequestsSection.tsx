'use client';

import React from 'react';
import type { RequestView } from '@/lib/repo-grants';
import { grantDecisionAction, revokeGrantAction, assignStewardAction } from '@/app/actions';
import { Icon } from '@/components/Icons';

interface StewardOption {
  id: number;
  name: string;
  role?: string;
  region?: string;
}

interface Props {
  requests: RequestView[];
  stewards?: StewardOption[];
}

interface RequestThread {
  threadKey: string;
  primary: RequestView;
  items: RequestView[];
}

export default function RequestsSection({ requests, stewards = [] }: Props) {
  const today = new Date().toISOString().split('T')[0];

  // Group requests into Stalled (forwarded / no steward), Active Open, and Past
  const stalledReqs = requests.filter((r) => r.status === 'forwarded');
  const openReqs = requests.filter((r) => r.status === 'open');
  const pastReqs = requests.filter((r) => r.status !== 'open' && r.status !== 'forwarded');

  // Thread grouping helper: combines identical requests from the same user on the same record
  function groupThreads(reqList: RequestView[]): RequestThread[] {
    const threadMap = new Map<string, RequestThread>();
    for (const r of reqList) {
      const key = `${r.record_id}:::${r.use_key}:::${(r.requester_name || '').toLowerCase().trim()}`;
      const existing = threadMap.get(key);
      if (existing) {
        existing.items.push(r);
      } else {
        threadMap.set(key, { threadKey: key, primary: r, items: [r] });
      }
    }
    return Array.from(threadMap.values());
  }

  const openThreads = groupThreads(openReqs);
  const stalledThreads = groupThreads(stalledReqs);

  return (
    <section aria-labelledby="reqs-heading" style={{ marginTop: 32 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <h2 id="reqs-heading" style={{ margin: 0 }}>
          Permission Requests ({openReqs.length} open{stalledReqs.length > 0 ? `, ${stalledReqs.length} stalled` : ''})
        </h2>
        {(openReqs.length > openThreads.length || stalledReqs.length > stalledThreads.length) && (
          <span className="chip" style={{ fontSize: '0.8rem', background: 'rgba(232, 120, 42, 0.15)', borderColor: 'rgba(232, 120, 42, 0.35)' }}>
            <Icon name="layers" size={13} /> Duplicate requests consolidated into threads
          </span>
        )}
      </div>

      {/* ---------------- 1. STALLED REQUESTS (Bridge Workflow Gap) ---------------- */}
      {stalledThreads.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span className="chip ask" style={{ fontWeight: 700, padding: '4px 12px', fontSize: '0.88rem' }}>
              ⚠️ Stalled Requests Awaiting Steward ({stalledThreads.length})
            </span>
            <span className="muted" style={{ fontSize: '0.84rem' }}>
              Requests cannot be decided until a community steward is assigned to the record.
            </span>
          </div>

          {stalledThreads.map((thread) => {
            const r = thread.primary;
            const threadIds = thread.items.map((i) => i.id).join(',');

            return (
              <div
                key={thread.threadKey}
                className="panel ui"
                style={{
                  marginBottom: 16,
                  borderLeft: '4px solid #f59e0b',
                  background: 'rgba(245, 158, 11, 0.05)',
                  padding: '18px 20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem' }}>
                    Request for <a href={`/r/${r.record_id}`}>{r.record_id}</a>
                  </h3>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {thread.items.length > 1 && (
                      <span className="chip" style={{ fontSize: '0.78rem', background: 'rgba(232, 147, 90, 0.2)' }}>
                        <Icon name="copy" size={12} /> {thread.items.length} Duplicate Submissions
                      </span>
                    )}
                    <span className="chip ask">Status: Stalled (Forwarded)</span>
                  </div>
                </div>

                <p style={{ margin: '8px 0 4px', fontSize: '0.94rem' }}>
                  <strong>From:</strong> {r.requester_name} · <strong>Purpose:</strong> {r.use_key.replace(/_/g, ' ')}
                </p>
                <p style={{ margin: '4px 0', fontSize: '0.92rem' }}>
                  <strong>Project Scope:</strong> {r.scope?.whatYouWillMake || '—'} ({r.scope?.whereAndHowLong || '—'})
                </p>
                <p className="muted" style={{ margin: '4px 0 12px', fontSize: '0.84rem' }}>
                  Submitted: {new Date(r.created_at).toLocaleString('en-IN')}
                </p>

                {/* Direct "Assign Steward" Shortcut to bridge the workflow gap */}
                <div
                  style={{
                    marginTop: 12,
                    padding: '12px 16px',
                    borderRadius: 12,
                    background: 'rgba(24, 15, 11, 0.6)',
                    border: '1.5px solid rgba(245, 158, 11, 0.4)',
                  }}
                >
                  <strong style={{ fontSize: '0.9rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon name="shield" size={15} />
                    Assign Steward to Unblock this Request
                  </strong>
                  <p className="muted" style={{ margin: '4px 0 10px', fontSize: '0.84rem' }}>
                    Assigning a steward to <strong>{r.record_id}</strong> will automatically resume this request to active review status.
                  </p>

                  <form action={assignStewardAction} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <input type="hidden" name="recordId" value={r.record_id} />
                    <select
                      name="userId"
                      required
                      style={{
                        minHeight: 40,
                        padding: '6px 12px',
                        borderRadius: 8,
                        fontSize: '0.88rem',
                        flex: '1 1 240px',
                      }}
                    >
                      <option value="">— Select Steward to Link —</option>
                      {stewards.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.region || 'All Regions'})
                        </option>
                      ))}
                    </select>

                    <button
                      type="submit"
                      className="btn pp-btn-maroon"
                      style={{
                        minHeight: 40,
                        padding: '0 18px',
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        borderRadius: 8,
                      }}
                    >
                      <Icon name="check" size={14} /> Assign & Unblock
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ---------------- 2. ACTIVE OPEN REQUESTS (Consolidated Threads) ---------------- */}
      {openThreads.length === 0 && stalledThreads.length === 0 ? (
        <p className="muted" style={{ marginTop: 14 }}>No open requests at this time.</p>
      ) : (
        openThreads.map((thread) => {
          const r = thread.primary;
          const threadIds = thread.items.map((i) => i.id).join(',');

          return (
            <div key={thread.threadKey} className="panel ui" style={{ marginTop: 18, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>
                  Request for <a href={`/r/${r.record_id}`}>{r.record_id}</a>
                </h3>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {thread.items.length > 1 && (
                    <span
                      className="chip"
                      style={{
                        fontSize: '0.8rem',
                        background: 'rgba(232, 147, 90, 0.22)',
                        borderColor: 'rgba(232, 147, 90, 0.5)',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                      }}
                    >
                      <Icon name="copy" size={12} /> {thread.items.length} Submissions in Thread
                    </span>
                  )}
                  <span className="chip ask">Status: {r.status}</span>
                </div>
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

              {/* Duplicate submissions accordion if thread has multiple submissions */}
              {thread.items.length > 1 && (
                <details style={{ margin: '8px 0 14px', fontSize: '0.86rem' }}>
                  <summary style={{ cursor: 'pointer', color: 'var(--pp-accent)' }}>
                    View all {thread.items.length} identical submissions in this thread
                  </summary>
                  <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
                    {thread.items.map((item, idx) => (
                      <li key={item.id} style={{ margin: '4px 0' }}>
                        Submission #{idx + 1} ({item.id.slice(0, 8)}...) on {new Date(item.created_at).toLocaleString('en-IN')}
                      </li>
                    ))}
                  </ul>
                </details>
              )}

              {/* Decision form */}
              <details className="evidence" open style={{ marginTop: 12 }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Decide request</summary>
                <form action={grantDecisionAction} style={{ marginTop: 12 }}>
                  <input type="hidden" name="requestId" value={r.id} />
                  <input type="hidden" name="threadRequestIds" value={threadIds} />

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
                    <button type="submit" name="decision" value="granted" className="btn pp-btn-maroon">
                      Grant permission & issue signed grant
                    </button>
                    <button type="submit" name="decision" value="declined" className="secondary">
                      Decline request
                    </button>
                  </div>
                </form>
              </details>
            </div>
          );
        })
      )}

      {/* ---------------- 3. PAST REQUESTS (Inverted Button Hierarchy) ---------------- */}
      {pastReqs.length > 0 && (
        <details className="panel" style={{ marginTop: 24 }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Past requests ({pastReqs.length})</summary>
          <div style={{ marginTop: 14 }}>
            {pastReqs.map((r) => (
              <div
                key={r.id}
                style={{
                  borderBottom: '1px solid var(--border)',
                  paddingBottom: 14,
                  marginBottom: 14,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <p style={{ margin: 0, fontSize: '0.98rem' }}>
                    <strong>{r.record_id}</strong> — {r.requester_name} ({r.use_key.replace(/_/g, ' ')})
                  </p>
                  <span className={`chip ${r.status === 'granted' ? 'verified' : 'ask'}`}>{r.status}</span>
                </div>

                {r.decision_note && <p className="muted" style={{ margin: '6px 0 10px', fontSize: '0.88rem' }}>Note: {r.decision_note}</p>}

                {/* Inverted Hierarchy: Primary action is "View signed grant", Revoke is demoted with confirmation */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginTop: 10 }}>
                  {r.grantId ? (
                    <a
                      href={`/g/${r.grantId}`}
                      className="btn secondary"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 7,
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        padding: '7px 18px',
                        borderRadius: 999,
                        border: '1.5px solid var(--pp-accent, #e8782a)',
                        color: 'var(--pp-ink)',
                        textDecoration: 'none',
                      }}
                    >
                      <Icon name="shield" size={15} />
                      <span>View signed grant →</span>
                    </a>
                  ) : <div />}

                  {r.status === 'granted' && (
                    <details style={{ display: 'inline-block' }}>
                      <summary
                        style={{
                          cursor: 'pointer',
                          fontSize: '0.82rem',
                          color: '#e57373',
                          textDecoration: 'underline',
                          opacity: 0.85,
                        }}
                      >
                        Revoke grant...
                      </summary>
                      <form
                        action={revokeGrantAction}
                        style={{
                          marginTop: 8,
                          padding: '10px 14px',
                          background: 'rgba(220, 53, 69, 0.1)',
                          border: '1px solid rgba(220, 53, 69, 0.3)',
                          borderRadius: 10,
                        }}
                      >
                        <input type="hidden" name="requestId" value={r.id} />
                        <label htmlFor={`revoke-note-${r.id}`} style={{ fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>
                          Reason for revocation (required):
                        </label>
                        <input
                          id={`revoke-note-${r.id}`}
                          type="text"
                          name="note"
                          placeholder="e.g. Terms breached / copyright dispute"
                          required
                          style={{
                            fontSize: '0.84rem',
                            padding: '6px 10px',
                            marginBottom: 8,
                            width: '100%',
                            borderRadius: 6,
                          }}
                        />
                        <button
                          type="submit"
                          className="danger"
                          style={{
                            fontSize: '0.8rem',
                            padding: '5px 14px',
                            borderRadius: 6,
                            cursor: 'pointer',
                          }}
                        >
                          Confirm Revocation
                        </button>
                      </form>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </section>
  );
}
