import { CAPABILITIES, CAP_PHRASE, LICENCES, type Capability, type CulturalState, type LicenceId } from '@/lib/permissions';
import { UNSPECIFIED_TEXT } from '@/lib/copy';

const ICON: Record<CulturalState, string> = { permitted: '✓', not_permitted: '✕', unspecified: '?' };
const WORD: Record<CulturalState, string> = { permitted: 'Permitted', not_permitted: 'Not permitted', unspecified: UNSPECIFIED_TEXT };
const CLS: Record<CulturalState, string> = { permitted: 'ok', not_permitted: 'no', unspecified: 'ask' };
const cap = (c: string) => c.charAt(0).toUpperCase() + c.slice(1);

export function PermissionChips({ permissions }: { permissions: Record<Capability, CulturalState> }) {
  return (
    <ul className="chips" aria-label="Cultural permissions as stated">
      {CAPABILITIES.map((c) => (
        <li key={c} className={`chip ${CLS[permissions[c]]}`}><span aria-hidden="true">{ICON[permissions[c]]} </span>{cap(CAP_PHRASE[c])}: {permissions[c] === 'unspecified' ? 'not stated' : WORD[permissions[c]].toLowerCase()}</li>
      ))}
    </ul>
  );
}

export function TwoLayers({ permissions, licence }: { permissions: Record<Capability, CulturalState>; licence: LicenceId }) {
  const lic = LICENCES[licence];
  const CELL = { yes: ['ok', '✓', 'Allowed'], no: ['no', '✕', 'Not allowed'], ask: ['ask', '?', 'Not clearly addressed'] } as const;
  return (
    <div className="two layers">
      <section className="panel" aria-labelledby="cultural-h">
        <h3 id="cultural-h"><span className="step-no" aria-hidden="true">1</span>Cultural permission</h3>
        <p className="hint">What the creators or community have said.</p>
        <ul className="chips">
          {CAPABILITIES.map((c) => (
            <li key={c} className={`chip ${CLS[permissions[c]]}`}><span aria-hidden="true">{ICON[permissions[c]]} </span>{cap(CAP_PHRASE[c])}: {WORD[permissions[c]]}</li>
          ))}
        </ul>
      </section>
      <section className="panel" aria-labelledby="licence-h">
        <h3 id="licence-h"><span className="step-no" aria-hidden="true">2</span>File licence</h3>
        <p className="hint">What the licence on the image file says: {lic.url ? <a href={lic.url}>{lic.label}</a> : lic.label}.</p>
        <ul className="chips">
          {CAPABILITIES.map((c) => { const [k, i, w] = CELL[lic.cells[c]]; return <li key={c} className={`chip ${k}`}><span aria-hidden="true">{i} </span>{cap(CAP_PHRASE[c])}: {w}</li>; })}
        </ul>
      </section>
    </div>
  );
}
