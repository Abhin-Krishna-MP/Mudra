'use client';

import React, { useState } from 'react';
import { Icon } from '@/components/Icons';
import { assignStewardAction, createOrPromoteStewardAction } from '@/app/actions';

interface UserOption {
  id: number;
  name: string;
  email: string;
  role: string;
  region: string;
  category: string;
}

interface RecordOption {
  id: string;
  title: string;
  region: string;
  category: string;
  status: string;
}

interface Props {
  users: UserOption[];
  records: RecordOption[];
}

export default function AddStewardSection({ users, records }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'assign' | 'create'>('assign');

  const stewardsList = users.filter((u) => u.role === 'steward' || u.role === 'reviewer' || u.role === 'admin');

  return (
    <div style={{ margin: '20px 0 28px' }}>
      {/* Top action bar with separate Add Steward button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="btn pp-btn-maroon"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 9,
            padding: '9px 22px',
            fontSize: '0.94rem',
            fontWeight: 700,
            borderRadius: 999,
            cursor: 'pointer',
          }}
          aria-expanded={isOpen}
        >
          <Icon name="shield" size={17} />
          <span>{isOpen ? 'Close Steward Manager' : '+ Add / Assign Steward'}</span>
        </button>

        <span className="muted" style={{ fontSize: '0.88rem' }}>
          {stewardsList.length} active steward{stewardsList.length === 1 ? '' : 's'} registered in system
        </span>
      </div>

      {/* Expandable management panel */}
      {isOpen && (
        <section
          className="panel ui"
          style={{
            marginTop: 18,
            padding: '24px 28px',
            borderRadius: 18,
            border: '2px solid var(--pp-accent, #e8782a)',
            background: 'var(--pp-card, rgba(34, 21, 15, 0.95))',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
          }}
          aria-label="Steward Management"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
            <div>
              <h3 style={{ margin: '0 0 6px', fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: 9 }}>
                <Icon name="users" size={22} />
                <span>Steward Management</span>
              </h3>
              <p className="muted" style={{ margin: 0, fontSize: '0.92rem' }}>
                Assign verified community stewards to cultural catalogue records, or onboard a new steward.
              </p>
            </div>

            {/* Mode Switcher Buttons */}
            <div style={{ display: 'inline-flex', background: 'rgba(0, 0, 0, 0.25)', padding: 4, borderRadius: 12, border: '1px solid var(--pp-edge, rgba(240, 137, 74, 0.3))' }}>
              <button
                type="button"
                onClick={() => setMode('assign')}
                className={`btn ${mode === 'assign' ? 'pp-btn-maroon' : 'secondary'}`}
                style={{
                  minHeight: 34,
                  padding: '4px 16px',
                  fontSize: '0.85rem',
                  borderRadius: 8,
                  fontWeight: mode === 'assign' ? 700 : 500,
                }}
              >
                Assign to Record
              </button>
              <button
                type="button"
                onClick={() => setMode('create')}
                className={`btn ${mode === 'create' ? 'pp-btn-maroon' : 'secondary'}`}
                style={{
                  minHeight: 34,
                  padding: '4px 16px',
                  fontSize: '0.85rem',
                  borderRadius: 8,
                  fontWeight: mode === 'create' ? 700 : 500,
                }}
              >
                + Register New Steward
              </button>
            </div>
          </div>

          {/* Mode 1: Assign Existing Steward to Record */}
          {mode === 'assign' && (
            <form action={assignStewardAction} style={{ marginTop: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                <div>
                  <label htmlFor="assign-record-select" style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>
                    1. Select Catalogue Record
                  </label>
                  <select
                    id="assign-record-select"
                    name="recordId"
                    required
                    style={{ width: '100%', minHeight: 46, padding: '8px 12px', borderRadius: 10, fontSize: '0.92rem' }}
                  >
                    <option value="">— Select a Record —</option>
                    {records.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title} ({r.id}) · {r.region || 'Kerala'} [{r.status}]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="assign-user-select" style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>
                    2. Select Steward to Link
                  </label>
                  <select
                    id="assign-user-select"
                    name="userId"
                    required
                    style={{ width: '100%', minHeight: 46, padding: '8px 12px', borderRadius: 10, fontSize: '0.92rem' }}
                  >
                    <option value="">— Select a Steward / Reviewer —</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email}) — [{u.role.toUpperCase()}{u.region ? ` · ${u.region}` : ''}]
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="btn-row" style={{ marginTop: 20 }}>
                <button
                  type="submit"
                  className="btn pp-btn-maroon"
                  style={{ minHeight: 44, padding: '0 24px', fontWeight: 700, borderRadius: 10 }}
                >
                  <Icon name="check" size={16} /> Link Steward to Record
                </button>
              </div>
            </form>
          )}

          {/* Mode 2: Register New Steward */}
          {mode === 'create' && (
            <form action={createOrPromoteStewardAction} style={{ marginTop: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                <div>
                  <label htmlFor="steward-name" style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>
                    Full Name *
                  </label>
                  <input
                    id="steward-name"
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Kalamandalam Krishnan Nair"
                    style={{ width: '100%', minHeight: 44, padding: '8px 12px', borderRadius: 10 }}
                  />
                </div>

                <div>
                  <label htmlFor="steward-email" style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>
                    Email Address *
                  </label>
                  <input
                    id="steward-email"
                    type="email"
                    name="email"
                    required
                    placeholder="e.g. steward@kalamandalam.org"
                    style={{ width: '100%', minHeight: 44, padding: '8px 12px', borderRadius: 10 }}
                  />
                </div>

                <div>
                  <label htmlFor="steward-region" style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>
                    Cultural Region
                  </label>
                  <input
                    id="steward-region"
                    type="text"
                    name="region"
                    placeholder="e.g. Kerala / Malabar / Valluvanad"
                    style={{ width: '100%', minHeight: 44, padding: '8px 12px', borderRadius: 10 }}
                  />
                </div>

                <div>
                  <label htmlFor="steward-category" style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>
                    Artform / Category
                  </label>
                  <input
                    id="steward-category"
                    type="text"
                    name="category"
                    placeholder="e.g. Performing Art / Ritual Art"
                    style={{ width: '100%', minHeight: 44, padding: '8px 12px', borderRadius: 10 }}
                  />
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <label htmlFor="steward-record-opt" style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  Link to Record immediately (Optional)
                </label>
                <select
                  id="steward-record-opt"
                  name="recordId"
                  style={{ width: '100%', minHeight: 44, padding: '8px 12px', borderRadius: 10 }}
                >
                  <option value="">— Do not link to a record yet —</option>
                  {records.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} ({r.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="btn-row" style={{ marginTop: 20 }}>
                <button
                  type="submit"
                  className="btn pp-btn-maroon"
                  style={{ minHeight: 44, padding: '0 24px', fontWeight: 700, borderRadius: 10 }}
                >
                  <Icon name="check" size={16} /> Register & Activate Steward
                </button>
              </div>
            </form>
          )}

          {/* Active Stewards Summary Chips */}
          <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--pp-edge, rgba(240, 137, 74, 0.25))' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--pp-muted)' }}>
              Currently Active Stewards:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {stewardsList.map((s) => (
                <span
                  key={s.id}
                  className="chip verified"
                  style={{ fontSize: '0.82rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                >
                  <Icon name="shield" size={12} />
                  <strong>{s.name}</strong>
                  {s.region && <span className="muted">({s.region})</span>}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
