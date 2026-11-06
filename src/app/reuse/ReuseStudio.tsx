'use client';
import { useState } from 'react';
import { evaluate, USES, USE_IDS, VERDICT_LABEL, type Use, type Capability, type CulturalState, type LicenceId, type Sensitivity, type Verdict } from '@/lib/permissions';
import { CopyButton } from '@/components/CopyButton';
import { Icon, type IconName } from '@/components/Icons';
import { Parasol } from '@/components/Ornaments';
import RequestPermissionForm from '@/components/RequestPermissionForm';

export interface Work {
  id: string; title: string; licence: LicenceId; attributionRequired: boolean; sensitivity: Sensitivity;
  permissions: Record<Capability, CulturalState>; credit: string;
  hasSteward?: boolean;
}

const ICON: Record<Verdict, IconName> = { permitted: 'checkCircle', ask_first: 'help', not_permitted: 'cross' };
const HEADLINE: Record<Verdict, string> = { permitted: 'You may use it.', ask_first: 'Ask first.', not_permitted: 'Not permitted.' };
const LICENCE_FACT: Record<Verdict, string> = { permitted: 'As stated', ask_first: 'Ask first', not_permitted: 'Not allowed' };

export default function ReuseStudio({ works, initialId, initialUse }: { works: Work[]; initialId: string; initialUse: Use }) {
  const [id, setId] = useState(initialId);
  const [use, setUse] = useState<Use>(initialUse);
  const [showRequest, setShowRequest] = useState(false);
  const w = works.find((x) => x.id === id) ?? works[0];
  if (!w) return <p className="muted">No records are published yet. <a href="/submit">Submit a work</a>.</p>;
  const out = evaluate({ use, licence: w.licence, cultural: w.permissions, attributionRequired: w.attributionRequired, sensitivity: w.sensitivity });
  const v = out.verdict;
  const useLabel = USES[use].label;

  return (
    <>
      <div className="studio ui">
        {/* ---------- Left: the form card ---------- */}
        <section className="rs-card rs-form" aria-labelledby="rs-form-h">
          <header className="rs-card-head">
            <span className="rs-card-ico" aria-hidden="true"><Icon name="layers" size={34} /></span>
            <div>
              <h2 id="rs-form-h">Check a cultural work</h2>
              <p>Provide the work details and your intended use to see if and how you can reuse it.</p>
            </div>
          </header>

          <label htmlFor="work" className="rs-label">Select a Work <span className="rs-i" aria-hidden="true"><Icon name="info" size={16} /></span></label>
          <select id="work" value={w.id} onChange={(e) => setId(e.target.value)}>
            {works.map((x) => <option key={x.id} value={x.id}>{x.title} ({x.id})</option>)}
          </select>

          <label htmlFor="purpose" className="rs-label">Your Purpose <span className="rs-i" aria-hidden="true"><Icon name="info" size={16} /></span></label>
          <select id="purpose" value={use} onChange={(e) => setUse(e.target.value as Use)}>
            {USE_IDS.map((u) => <option key={u} value={u}>{USES[u].label}</option>)}
          </select>

          <p className="rs-note">
            <Icon name="info" size={20} />
            <span>The answer combines what the creators or community have said with what the file licence allows, and always takes the more careful one.</span>
          </p>

          <div className="rs-actions">
            {v === 'ask_first' && (
              <button type="button" className="btn rs-btn rs-btn-fill" onClick={() => setShowRequest(!showRequest)}>
                {showRequest ? 'Close request form' : 'Request permission'}
              </button>
            )}
            <CopyButton text={w.credit} label="Copy Credit Line" variant={v === 'ask_first' ? 'secondary' : 'primary'} />
            <a className="btn secondary rs-btn rs-btn-ghost" href={`/r/${w.id}?use=${use}#studio-h`}>View Full Terms <Icon name="arrow" size={18} /></a>
          </div>
        </section>

        {/* ---------- Right: the verdict card ---------- */}
        <div className="result-wrap" aria-live="polite">
          <Parasol className="parasol" />
          <div className={`rs-result ${v}`} role="status">
            <svg className="rs-frond" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
              <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M4 10c30 4 70 22 104 70" /><path d="M20 14c10 14 16 30 18 50M36 22c12 12 22 28 28 48M52 34c10 10 18 24 24 40M68 46c8 8 14 18 18 30" />
                <path d="M16 14c16 2 30 10 40 24M30 24c14 2 26 10 36 22M46 38c12 2 22 8 30 18" />
              </g>
            </svg>
            <span className="rs-seal" aria-hidden="true"><Icon name={ICON[v]} size={38} /></span>
            <p className="r-title">{HEADLINE[v]}</p>
            <p className="rs-verdict-line"><span className="rs-use">{useLabel}:</span> {VERDICT_LABEL[v]}.</p>
            <p className="rs-next">{v === 'permitted' ? out.nextAction : out.guidance.slice(out.guidance.indexOf('because') >= 0 ? out.guidance.indexOf('because') : 0).replace(/^because/, 'Because')}</p>
            <ul className="rs-facts">
              <li><Icon name="book" size={32} /><div><b>Purpose</b><span>{useLabel}</span></div></li>
              <li><Icon name="shield" size={32} /><div><b>Licence</b><span>{LICENCE_FACT[out.licence.verdict]}</span></div></li>
              <li><Icon name="scale" size={32} /><div><b>Conditions</b><span>{out.creditRequired ? 'Give credit' : 'Credit advised'}</span></div></li>
            </ul>
          </div>
        </div>
      </div>

      {showRequest && v === 'ask_first' && (
        <RequestPermissionForm
          recordId={w.id}
          recordTitle={w.title}
          useKey={use}
          hasSteward={!!w.hasSteward}
          onCancel={() => setShowRequest(false)}
        />
      )}

      <details className="rs-how">
        <summary>
          <span className="rs-how-tri" aria-hidden="true" />
          <span>How this answer was reached</span>
          <Icon name="file" size={26} className="rs-how-ico" />
        </summary>
        <div className="rs-how-body">
          <div className="two">
            <div><h3>Cultural layer</h3><p>{out.cultural.statement}</p></div>
            <div><h3>File licence layer</h3><p>{out.licence.statement}</p></div>
          </div>
          {out.notes.map((n) => <p key={n} className="notice">{n}</p>)}
          <p><strong>Next step:</strong> {out.nextAction}</p>
          <p className="hint">{out.creditRequired ? 'Credit is required here.' : 'Credit is not required by the licence, but is recommended.'}</p>
        </div>
      </details>
    </>
  );
}
