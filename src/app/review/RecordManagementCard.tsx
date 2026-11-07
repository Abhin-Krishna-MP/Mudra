'use client';

import React, { useState } from 'react';
import { Icon } from '@/components/Icons';
import { reviewFormAction, assignStewardAction, unassignStewardAction } from '@/app/actions';

export interface RecordItem {
  id: string;
  status: string;
  verification_level: string;
  disputed: number;
  title: string;
  region: string;
  category: string;
  revision_note: string;
  asset_id?: string;
  asset_alt?: string;
  deleted_at?: string;
  recycle_until?: string;
}

export interface StewardUser {
  id: number;
  name: string;
  email: string;
  role: string;
  region: string;
  category: string;
}

interface Props {
  record: RecordItem;
  linkedStewards: Array<{ id: number; name: string }>;
  allStewards: StewardUser[];
}

export default function RecordManagementCard({ record: r, linkedStewards, allStewards }: Props) {
  const [activeTab, setActiveTab] = useState<'moderation' | 'verification' | 'stewardship'>('moderation');
  const [showReassignForm, setShowReassignForm] = useState(false);

  return (
    <section className="rc-record-card" aria-label={r.title}>
      {/* Top row with Thumbnail and Metadata */}
      <div className="rc-record-top">
        {/* Left Artwork Thumbnail */}
        <div className="rc-record-thumb">
          {r.asset_id ? (
            <img src={`/api/assets/${r.asset_id}`} alt={r.asset_alt || r.title} />
          ) : (
            <div style={{ color: 'var(--rc-accent, #c47c1a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="image" size={32} />
            </div>
          )}
        </div>

        {/* Right Info */}
        <div className="rc-record-meta">
          <h3 className="rc-record-title">
            <a href={`/r/${r.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
              {r.title}
            </a>{' '}
            <span style={{ fontWeight: 400, fontSize: '0.92rem', color: 'var(--rc-muted)' }}>({r.id})</span>
          </h3>

          {/* Metadata Chips */}
          <ul className="rc-record-chips">
            <li
              className="chip"
              style={{
                background: r.status === 'published' ? '#edf7ed' : r.status === 'removed' ? '#ffebee' : '#fff3e0',
                color: r.status === 'published' ? '#1b5e20' : r.status === 'removed' ? '#c62828' : '#b45309',
                borderColor: r.status === 'published' ? '#c8e6c9' : r.status === 'removed' ? '#ffcdd2' : '#fed7aa',
                fontWeight: 600,
                textTransform: 'capitalize',
              }}
            >
              {r.status === 'removed' ? 'Recycle Bin (30d)' : String(r.status).replace('_', ' ')}
            </li>

            <li className="chip" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Icon name="pin" size={13} />
              <span>{r.region || 'Kerala'}</span>
            </li>

            <li className="chip" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Icon name="layers" size={13} />
              <span>{r.category || 'Cultural Work'}</span>
            </li>

            <li className="chip" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Icon name="shield" size={13} />
              <span style={{ textTransform: 'capitalize' }}>{r.verification_level}</span>
            </li>

            {r.disputed ? <li className="chip ask">Open Report</li> : null}

            {/* Assigned Stewards Badge with integrated inline removal button (No redundant red text) */}
            {linkedStewards.map((s) => (
              <li
                key={s.id}
                className="chip chip-steward"
                style={{
                  background: '#0d4734',
                  color: '#ffffff',
                  borderColor: '#0d4734',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '3px 8px 3px 10px',
                }}
              >
                <Icon name="user" size={13} />
                <span>Steward: {s.name}</span>
                <form action={unassignStewardAction} style={{ display: 'inline', margin: 0, lineHeight: 1 }}>
                  <input type="hidden" name="recordId" value={r.id} />
                  <input type="hidden" name="userId" value={s.id} />
                  <button
                    type="submit"
                    title={`Unassign ${s.name}`}
                    style={{
                      background: 'rgba(255, 255, 255, 0.28)',
                      border: 0,
                      borderRadius: '50%',
                      width: 17,
                      height: 17,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      cursor: 'pointer',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: 0,
                      marginLeft: 2,
                    }}
                  >
                    ✕
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Seamless Continuous Tab System */}
      <div className="rc-tab-container">
        {/* Horizontal Tab Buttons */}
        <div className="rc-tab-bar" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'moderation'}
            onClick={() => setActiveTab('moderation')}
            className={`rc-tab-btn ${activeTab === 'moderation' ? 'active' : ''}`}
          >
            <Icon name="scale" size={15} />
            <span>Moderation & Review</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'verification'}
            onClick={() => setActiveTab('verification')}
            className={`rc-tab-btn ${activeTab === 'verification' ? 'active' : ''}`}
          >
            <Icon name="shield" size={15} />
            <span>Evidence Verification</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'stewardship'}
            onClick={() => setActiveTab('stewardship')}
            className={`rc-tab-btn ${activeTab === 'stewardship' ? 'active' : ''}`}
          >
            <Icon name="users" size={15} />
            <span>Stewardship ({linkedStewards.length})</span>
          </button>
        </div>

        {/* Tab Content Box — Continuous with Active Tab */}
        <div className="rc-tab-content" role="tabpanel">
          {/* Tab 1: Moderation & Review */}
          {activeTab === 'moderation' && (
            <div>
              {r.revision_note && (
                <div className="rc-callout" style={{ marginBottom: 14 }}>
                  <Icon name="quote" size={16} />
                  <div>
                    <strong>Current Revision Note:</strong> {r.revision_note}
                  </div>
                </div>
              )}

              <form action={reviewFormAction}>
                <input type="hidden" name="recordId" value={r.id} />

                <label htmlFor={`n-${r.id}`} className="rc-edit-note-label">
                  <Icon name="quote" size={15} />
                  <span>Required edits or reviewer note (required when requesting revision)</span>
                </label>
                <input
                  id={`n-${r.id}`}
                  type="text"
                  name="note"
                  className="rc-edit-note-input"
                  placeholder="Describe edits for author (e.g. Please verify tradition lineage)..."
                />

                <div className="btn-row" style={{ marginTop: 16 }}>
                  {r.status !== 'published' ? (
                    <button type="submit" name="action" value="approve" className="btn pp-btn-maroon" title="Approve and move to Catalogue">
                      <Icon name="check" size={15} /> Approve (Move to Catalogue)
                    </button>
                  ) : (
                    <span className="chip" style={{ background: '#edf7ed', color: '#1b5e20', borderColor: '#c8e6c9', fontWeight: 600 }}>
                      <Icon name="checkCircle" size={14} /> Active in Catalogue
                    </span>
                  )}

                  <button type="submit" name="action" value="requestRevision" className="btn secondary" title="Request author revisions with notes">
                    Request Revision
                  </button>

                  {r.status === 'removed' ? (
                    <button type="submit" name="action" value="restore" className="btn secondary" title="Restore from recycle bin to active review">
                      <Icon name="refresh" size={14} /> Restore to Review
                    </button>
                  ) : (
                    <button type="submit" name="action" value="deny" className="btn danger" title="Deny record and send to 30-day recycle bin">
                      Deny (Recycle Bin - 30d)
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Tab 2: Evidence Verification */}
          {activeTab === 'verification' && (
            <div>
              <form action={reviewFormAction}>
                <input type="hidden" name="recordId" value={r.id} />
                <input type="hidden" name="action" value="verify" />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                  <div>
                    <label htmlFor={`s-${r.id}`} style={{ fontWeight: 600, display: 'block', marginBottom: 6, fontSize: '0.88rem', color: 'var(--rc-ink)' }}>
                      Evidence source *
                    </label>
                    <input
                      id={`s-${r.id}`}
                      type="text"
                      name="source"
                      required
                      placeholder="e.g. State Folklore Academy Gazette / Gurukulam record"
                      className="rc-edit-note-input"
                      style={{ minHeight: 42 }}
                    />
                  </div>

                  <div>
                    <label htmlFor={`u-${r.id}`} style={{ fontWeight: 600, display: 'block', marginBottom: 6, fontSize: '0.88rem', color: 'var(--rc-ink)' }}>
                      Evidence URL (optional)
                    </label>
                    <input
                      id={`u-${r.id}`}
                      type="url"
                      name="url"
                      placeholder="https://..."
                      className="rc-edit-note-input"
                      style={{ minHeight: 42 }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <label htmlFor={`e-${r.id}`} style={{ fontWeight: 600, display: 'block', marginBottom: 6, fontSize: '0.88rem', color: 'var(--rc-ink)' }}>
                    Evidence note *
                  </label>
                  <textarea
                    id={`e-${r.id}`}
                    name="note"
                    required
                    rows={3}
                    placeholder="Details of the verification check performed against cultural evidence..."
                    className="rc-edit-note-input"
                    style={{ minHeight: 70 }}
                  />
                </div>

                <div className="btn-row" style={{ marginTop: 14 }}>
                  <button type="submit" className="btn pp-btn-maroon">
                    <Icon name="shield" size={15} /> Mark Verified with Evidence
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 3: Stewardship (Resolves Conflicting Logic: Shows Profile Card when assigned, dropdown when 0) */}
          {activeTab === 'stewardship' && (
            <div>
              {linkedStewards.length > 0 && !showReassignForm ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                    <h4 style={{ margin: 0, fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: 7, color: 'var(--rc-ink)' }}>
                      <Icon name="shield" size={17} />
                      <span>Currently Assigned Steward{linkedStewards.length > 1 ? 's' : ''} ({linkedStewards.length})</span>
                    </h4>

                    <button
                      type="button"
                      onClick={() => setShowReassignForm(true)}
                      className="btn secondary"
                      style={{ minHeight: 34, padding: '4px 14px', fontSize: '0.84rem', fontWeight: 600, borderRadius: 8 }}
                    >
                      + Reassign / Link Another Steward
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                    {linkedStewards.map((steward) => {
                      const details = allStewards.find((s) => s.id === steward.id);
                      return (
                        <div
                          key={steward.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '14px 18px',
                            borderRadius: 12,
                            border: '1.5px solid var(--rc-panel-border)',
                            background: 'rgba(13, 71, 52, 0.05)',
                            gap: 14,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div
                              style={{
                                width: 42,
                                height: 42,
                                borderRadius: '50%',
                                background: '#0d4734',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '1rem',
                                flex: 'none',
                              }}
                            >
                              {steward.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--rc-ink)' }}>
                                {steward.name}
                              </strong>
                              <span style={{ fontSize: '0.82rem', color: 'var(--rc-muted)' }}>
                                {details?.region ? `${details.region} · ` : ''}
                                {details?.category || 'Community Cultural Steward'}
                              </span>
                            </div>
                          </div>

                          <form action={unassignStewardAction} style={{ margin: 0 }}>
                            <input type="hidden" name="recordId" value={r.id} />
                            <input type="hidden" name="userId" value={steward.id} />
                            <button
                              type="submit"
                              className="btn danger"
                              style={{ minHeight: 34, padding: '4px 14px', fontSize: '0.82rem', borderRadius: 8 }}
                              title={`Unassign ${steward.name}`}
                            >
                              Remove
                            </button>
                          </form>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div>
                  {linkedStewards.length > 0 && (
                    <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => setShowReassignForm(false)}
                        className="btn secondary"
                        style={{ minHeight: 30, padding: '2px 14px', fontSize: '0.82rem' }}
                      >
                        ← Back to Current Steward
                      </button>
                    </div>
                  )}

                  <form
                    action={assignStewardAction}
                    style={{
                      padding: '16px 20px',
                      borderRadius: 12,
                      background: 'rgba(180, 140, 90, 0.05)',
                      border: '1.5px solid var(--rc-panel-border)',
                    }}
                  >
                    <input type="hidden" name="recordId" value={r.id} />
                    <label
                      htmlFor={`link-steward-${r.id}`}
                      style={{ fontWeight: 600, display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--rc-ink)' }}
                    >
                      {linkedStewards.length > 0 ? 'Select a steward to reassign or add:' : 'Link a Steward to this record:'}
                    </label>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                      <select
                        id={`link-steward-${r.id}`}
                        name="userId"
                        required
                        style={{
                          minHeight: 42,
                          padding: '6px 12px',
                          borderRadius: 8,
                          fontSize: '0.9rem',
                          flex: '1 1 260px',
                          border: '1.5px solid var(--rc-panel-border)',
                          background: 'var(--rc-card, #ffffff)',
                          color: 'var(--rc-ink, #2b1810)',
                        }}
                      >
                        <option value="">— Select Steward / Reviewer —</option>
                        {allStewards.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.email}) [{u.role.toUpperCase()}{u.region ? ` · ${u.region}` : ''}]
                          </option>
                        ))}
                      </select>

                      <button
                        type="submit"
                        className="btn pp-btn-maroon"
                        style={{ minHeight: 42, padding: '0 20px', fontSize: '0.88rem', fontWeight: 700, borderRadius: 8 }}
                      >
                        <Icon name="check" size={15} /> Link Steward
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
