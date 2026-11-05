'use client';
import { useState } from 'react';
import { evaluate, USES, USE_IDS, type Use, type Capability, type CulturalState, type LicenceId, type Sensitivity } from '@/lib/permissions';
import { VerdictCard } from '@/components/VerdictCard';
import { CopyButton } from '@/components/CopyButton';
import { Icon } from '@/components/Icons';
import { Parasol } from '@/components/Ornaments';

export interface Work {
  id: string; title: string; licence: LicenceId; attributionRequired: boolean; sensitivity: Sensitivity;
  permissions: Record<Capability, CulturalState>; credit: string;
}

export default function ReuseStudio({ works, initialId, initialUse }: { works: Work[]; initialId: string; initialUse: Use }) {
  const [id, setId] = useState(initialId);
  const [use, setUse] = useState<Use>(initialUse);
  const w = works.find((x) => x.id === id) ?? works[0];
  if (!w) return <p className="muted">No records are published yet. <a href="/submit">Submit a work</a>.</p>;
  const out = evaluate({ use, licence: w.licence, cultural: w.permissions, attributionRequired: w.attributionRequired, sensitivity: w.sensitivity });
  return (
    <>
      <div className="studio ui">
        <div>
          <label htmlFor="work" style={{ marginTop: 0 }}>Select a Work</label>
          <select id="work" value={w.id} onChange={(e) => setId(e.target.value)}>
            {works.map((x) => <option key={x.id} value={x.id}>{x.title} ({x.id})</option>)}
          </select>
          <label htmlFor="purpose">Your Purpose</label>
          <select id="purpose" value={use} onChange={(e) => setUse(e.target.value as Use)}>
            {USE_IDS.map((u) => <option key={u} value={u}>{USES[u].label}</option>)}
          </select>
          <p className="hint" style={{ marginTop: 12 }}>The answer combines what the creators or community have said with what the file licence allows, and always takes the more careful one.</p>
        </div>
        <div className="result-wrap" aria-live="polite">
          <Parasol className="parasol" />
          <VerdictCard verdict={out.verdict} useLabel={USES[use].label} guidance={out.guidance} />
        </div>
      </div>
      <div className="btn-row">
        <CopyButton text={w.credit} label="Copy Credit Line" variant="primary" />
        <a className="btn secondary" href={`/r/${w.id}?use=${use}#studio-h`}>View Full Terms <Icon name="arrow" size={18} /></a>
      </div>
      <details className="panel" style={{ marginTop: 22 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>How this answer was reached</summary>
        <div className="two" style={{ marginTop: 14 }}>
          <div><h3>Cultural layer</h3><p>{out.cultural.statement}</p></div>
          <div><h3>File licence layer</h3><p>{out.licence.statement}</p></div>
        </div>
        {out.notes.map((n) => <p key={n} className="notice">{n}</p>)}
        <p><strong>Next step:</strong> {out.nextAction}</p>
        <p className="hint">{out.creditRequired ? 'Credit is required here.' : 'Credit is not required by the licence, but is recommended.'}</p>
      </details>
    </>
  );
}
