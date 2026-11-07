'use client';

import React, { useState, useTransition } from 'react';
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

function formatTimestamp(isoString: string | null | undefined): string {
  if (!isoString) return '—';
  const clean = String(isoString).replace('T', ' ');
  return clean.slice(0, 16);
}

export default function RequestsSection({ requests, stewards = [] }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<string | null>(null);

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

  const handleDecisionSubmit = (e: React.FormEvent<HTMLFormElement>, reqId: string) => {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const decisionVal = submitter?.value || 'granted';
    setPendingAction(`${decisionVal}-${reqId}`);
    const fd = new FormData(e.currentTarget);
    if (decisionVal) fd.set('decision', decisionVal);
    startTransition(async () => {
      try {
        await grantDecisionAction(fd);
      } finally {
        setPendingAction(null);
      }
    });
  };

  const handleAssignSubmit = (e: React.FormEvent<HTMLFormElement>, recId: string) => {
    e.preventDefault();
    setPendingAction(`assign-${recId}`);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await assignStewardAction(fd);
      } finally {
        setPendingAction(null);
      }
    });
  };

  const handleRevokeSubmit = (e: React.FormEvent<HTMLFormElement>, reqId: string) => {
    e.preventDefault();
    setPendingAction(`revoke-${reqId}`);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await revokeGrantAction(fd);
      } finally {
        setPendingAction(null);
      }
    });
  };

  return (
    <section className="rc-section-block" aria-labelledby="reqs-heading">
      <div className="rc-section-header-wrap">
        <h2 id="reqs-heading" className="rc-section-heading" style={{ margin: 0 }}>
          <Icon name="users" size={22} />
          <span>Permission Requests ({openReqs.length} open{stalledReqs.length > 0 ? `, ${stalledReqs.length} stalled` : ''})</span>
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {(openReqs.length > openThreads.length || stalledReqs.length > stalledThreads.length) && (
            <span className="chip" style={{ fontSize: '0.8rem', background: 'rgba(232, 120, 42, 0.15)', borderColor: 'rgba(232, 120, 42, 0.35)' }}>
              <Icon name="layers" size={13} /> Threads consolidated
            </span>
          )}
          <span className="rc-section-tag requests">Ask First System</span>
        </div>
      </div>

      {openReqs.length === 0 && stalledReqs.length === 0 && (
        <div className="rc-empty-card" style={{ marginTop: 12 }}>
          <Icon name="checkCircle" size={18} />
          <span>No open or stalled permission requests at this time.</span>
        </div>
      )}

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

                {/* 2-Column Key-Value Data Grid */}
                <div className="rc-req-grid">
                  <div className="rc-req-cell">
                    <span className="rc-req-label">From:</span>
                    <span className="rc-req-val">{r.requester_name}</span>
                  </div>
                  <div className="rc-req-cell">
                    <span className="rc-req-label">Purpose:</span>
                    <span className="rc-req-val">{r.use_key.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="rc-req-cell">
                    <span className="rc-req-label">What:</span>
                    <span className="rc-req-val">{r.scope?.whatYouWillMake || '—'}</span>
                  </div>
                  <div className="rc-req-cell">
                    <span className="rc-req-label">Where:</span>
                    <span className="rc-req-val">{r.scope?.whereAndHowLong || '—'}</span>
                  </div>
                </div>
                <div className="muted" style={{ margin: '0 0 12px', fontSize: '0.82rem' }} suppressHydrationWarning>
                  Submitted: {formatTimestamp(r.created_at)}
                </div>

                {/* Direct "Assign Steward" Shortcut to bridge the workflow gap */}
                <div
                  style={{
                    marginTop: 12,
                    padding: '14px 18px',
                    borderRadius: 12,
                    background: 'var(--rc-card, #ffffff)',
                    border: '1.5px solid #f3d19c',
                    color: 'var(--rc-ink, #2b1810)',
                  }}
                >
                  <strong style={{ fontSize: '0.9rem', color: '#b45309', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon name="shield" size={15} />
                    Assign Steward to Unblock this Request
                  </strong>
                  <p style={{ margin: '4px 0 10px', fontSize: '0.84rem', color: 'var(--rc-muted)' }}>
                    Assigning a steward to <strong>{r.record_id}</strong> will automatically resume this request to active review status.
                  </p>

                  <form onSubmit={(e) => handleAssignSubmit(e, r.record_id)} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
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
                        background: 'var(--rc-card, #ffffff)',
                        color: 'var(--rc-ink, #2b1810)',
                        border: '1.5px solid var(--rc-panel-border, #d5c3b0)',
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
                      disabled={isPending}
                      className="btn pp-btn-maroon"
                      style={{
                        minHeight: 40,
                        padding: '0 18px',
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        borderRadius: 8,
                      }}
                    >
                      <Icon name="check" size={14} />
                      <span>{pendingAction === `assign-${r.record_id}` ? 'Assigning…' : 'Assign & Unblock'}</span>
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ---------------- 2. ACTIVE OPEN REQUESTS (Consolidated Threads) ---------------- */}
      {openThreads.map((thread) => {
          const r = thread.primary;
          const threadIds = thread.items.map((i) => i.id).join(',');

          return (
            <div key={thread.threadKey} className="rc-record-card" style={{ marginTop: 18, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--rc-ink)' }}>
                  Request for <a href={`/r/${r.record_id}`} style={{ color: 'var(--rc-maroon, #751b16)' }}>{r.record_id}</a>
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

              {/* 2-Column Key-Value Data Grid */}
              <div className="rc-req-grid">
                <div className="rc-req-cell">
                  <span className="rc-req-label">From:</span>
                  <span className="rc-req-val">{r.requester_name}</span>
                </div>
                <div className="rc-req-cell">
                  <span className="rc-req-label">Purpose:</span>
                  <span className="rc-req-val">{r.use_key.replace(/_/g, ' ')}</span>
                </div>
                <div className="rc-req-cell">
                  <span className="rc-req-label">What:</span>
                  <span className="rc-req-val">{r.scope?.whatYouWillMake || '—'}</span>
                </div>
                <div className="rc-req-cell">
                  <span className="rc-req-label">Where:</span>
                  <span className="rc-req-val">{r.scope?.whereAndHowLong || '—'}</span>
                </div>
              </div>
              <div className="muted" style={{ margin: '0 0 14px', fontSize: '0.82rem' }} suppressHydrationWarning>
                Submitted: {formatTimestamp(r.created_at)}
              </div>

              {/* Duplicate submissions accordion if thread has multiple submissions */}
              {thread.items.length > 1 && (
                <details style={{ margin: '8px 0 14px', fontSize: '0.86rem' }}>
                  <summary style={{ cursor: 'pointer', color: 'var(--rc-accent, #c47c1a)', fontWeight: 600 }}>
                    View all {thread.items.length} identical submissions in this thread
                  </summary>
                  <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
                    {thread.items.map((item, idx) => (
                      <li key={item.id} style={{ margin: '4px 0' }} suppressHydrationWarning>
                        Submission #{idx + 1} ({item.id.slice(0, 8)}...) on {formatTimestamp(item.created_at)}
                      </li>
                    ))}
                  </ul>
                </details>
              )}

              {/* Decision form */}
              <details className="evidence" open style={{ marginTop: 12 }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--rc-ink)' }}>Decide request</summary>
                <form onSubmit={(e) => handleDecisionSubmit(e, r.id)} style={{ marginTop: 12 }}>
                  <input type="hidden" name="requestId" value={r.id} />
                  <input type="hidden" name="threadRequestIds" value={threadIds} />

                  <label htmlFor={`cond-${r.id}`} style={{ fontWeight: 600, display: 'block', marginBottom: 4, fontSize: '0.88rem', color: 'var(--rc-ink)' }}>
                    Conditions (one per line, optional)
                  </label>
                  <textarea
                    id={`cond-${r.id}`}
                    name="conditions"
                    rows={2}
                    placeholder="e.g. Credit must accompany every print&#10;Limited run of 500 copies"
                    className="rc-edit-note-input"
                    style={{ minHeight: 60, marginBottom: 12 }}
                  />

                  <label htmlFor={`credit-${r.id}`} style={{ fontWeight: 600, display: 'block', marginBottom: 4, fontSize: '0.88rem', color: 'var(--rc-ink)' }}>
                    Required credit line (optional)
                  </label>
                  <input
                    id={`credit-${r.id}`}
                    type="text"
                    name="creditText"
                    placeholder="e.g. Courtesy of the Community Custodians via Mudra"
                    className="rc-edit-note-input"
                    style={{ minHeight: 42, marginBottom: 12 }}
                  />

                  {/* Connected Date Range Row with arrow */}
                  <div style={{ margin: '10px 0 14px' }}>
                    <span style={{ fontWeight: 600, display: 'block', marginBottom: 6, fontSize: '0.88rem', color: 'var(--rc-ink)' }}>
                      Validity Period
                    </span>
                    <div className="rc-date-range-row">
                      <div style={{ flex: '1 1 180px' }}>
                        <label htmlFor={`vf-${r.id}`} className="rc-date-sublabel">Valid from</label>
                        <input id={`vf-${r.id}`} type="date" name="validFrom" defaultValue={today} required suppressHydrationWarning className="rc-edit-note-input" style={{ minHeight: 40 }} />
                      </div>
                      <div className="rc-date-arrow" aria-hidden="true">→</div>
                      <div style={{ flex: '1 1 180px' }}>
                        <label htmlFor={`vu-${r.id}`} className="rc-date-sublabel">Valid until (optional)</label>
                        <input id={`vu-${r.id}`} type="date" name="validUntil" className="rc-edit-note-input" style={{ minHeight: 40 }} />
                      </div>
                    </div>
                  </div>

                  <label htmlFor={`note-${r.id}`} style={{ fontWeight: 600, display: 'block', marginBottom: 4, fontSize: '0.88rem', color: 'var(--rc-ink)' }}>
                    Decision note (optional for grant; required if declining)
                  </label>
                  <input
                    id={`note-${r.id}`}
                    type="text"
                    name="note"
                    placeholder="Note to requester"
                    className="rc-edit-note-input"
                    style={{ minHeight: 42 }}
                  />

                  <div className="btn-row" style={{ marginTop: 16 }}>
                    <button
                      type="submit"
                      name="decision"
                      value="granted"
                      disabled={isPending}
                      className="btn pp-btn-maroon"
                    >
                      <Icon name="check" size={15} />
                      <span>{pendingAction === `granted-${r.id}` ? 'Granting…' : 'Grant permission & issue signed grant'}</span>
                    </button>
                    <button
                      type="submit"
                      name="decision"
                      value="declined"
                      disabled={isPending}
                      className="btn secondary"
                    >
                      <span>{pendingAction === `declined-${r.id}` ? 'Declining…' : 'Decline request'}</span>
                    </button>
                  </div>
                </form>
              </details>
            </div>
          );
        })}

      {/* ---------------- 3. PAST REQUESTS (Matching User Image Accordion Bar) ---------------- */}
      {pastReqs.length > 0 && (
        <details
          style={{
            marginTop: 18,
            marginBottom: 20,
            background: 'var(--rc-panel, #fffdf9)',
            border: '1.5px solid var(--rc-panel-border, rgba(180, 140, 90, 0.28))',
            borderRadius: 14,
            padding: '14px 20px',
            boxShadow: '0 2px 8px rgba(80, 45, 20, 0.03)',
          }}
        >
          <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: '0.98rem', color: 'var(--rc-ink)', outline: 'none' }}>
            Past Requests ({pastReqs.length})
          </summary>
          <div style={{ marginTop: 14, paddingTop: 6 }}>
            {pastReqs.map((r) => (
              <div
                key={r.id}
                className="rc-past-req-item"
              >
                {/* Left: Requester Info, Record, Purpose, Note */}
                <div className="rc-past-req-info">
                  <div className="rc-past-req-title">
                    <a href={`/r/${r.record_id}`} className="rc-past-req-link">
                      {r.record_id}
                    </a>
                    <span className="rc-past-req-sep">·</span>
                    <span className="rc-past-req-name">{r.requester_name}</span>
                  </div>
                  <div className="rc-past-req-purpose">
                    Purpose: {r.use_key.replace(/_/g, ' ')}
                  </div>
                  {Boolean(r.decision_note) && (
                    <div className="rc-past-req-note">Note: {r.decision_note}</div>
                  )}
                </div>

                {/* Right: Horizontally Aligned Actions & Status Cluster */}
                <div className="rc-past-req-actions">
                  <span className={`chip ${r.status === 'granted' ? 'verified' : 'ask'}`}>{r.status}</span>

                  {r.grantId && (
                    <a
                      href={`/g/${r.grantId}`}
                      className="btn secondary rc-btn-view-grant"
                    >
                      <Icon name="shield" size={14} />
                      <span>View signed grant →</span>
                    </a>
                  )}

                  {r.status === 'granted' && (
                    <details className="rc-revoke-details">
                      <summary className="rc-revoke-link">
                        Revoke grant...
                      </summary>
                      <form
                        onSubmit={(e) => handleRevokeSubmit(e, r.id)}
                        className="rc-revoke-form"
                      >
                        <input type="hidden" name="requestId" value={r.id} />
                        <label htmlFor={`revoke-note-${r.id}`} style={{ fontSize: '0.8rem', display: 'block', marginBottom: 4, color: 'var(--rc-ink)' }}>
                          Reason for revocation (required):
                        </label>
                        <input
                          id={`revoke-note-${r.id}`}
                          type="text"
                          name="note"
                          placeholder="e.g. Terms breached / copyright dispute"
                          required
                          className="rc-edit-note-input"
                          style={{
                            fontSize: '0.84rem',
                            padding: '6px 10px',
                            marginBottom: 8,
                            width: '100%',
                            minHeight: 34,
                          }}
                        />
                        <button
                          type="submit"
                          disabled={isPending}
                          className="danger"
                          style={{
                            fontSize: '0.8rem',
                            padding: '6px 14px',
                            borderRadius: 6,
                            cursor: isPending ? 'wait' : 'pointer',
                            width: '100%',
                          }}
                        >
                          {pendingAction === `revoke-${r.id}` ? 'Revoking…' : 'Confirm Revocation'}
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
