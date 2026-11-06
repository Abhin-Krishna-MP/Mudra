import { getDb } from '@/lib/db';
import { listRecords, getRecordView, verifyRecord, auditRows } from '@/lib/repo';
import { publicKeys } from '@/lib/signing';
import { PageSheet } from '@/components/PageSheet';
import { Icon } from '@/components/Icons';
import '../reuse/reuse.css';
import './verify.css';

const sv = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: false } as const;
const Qr = ({ size = 30 }: { size?: number }) => (
  <svg {...sv} width={size} height={size}><path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" /><rect x="7.5" y="7.5" width="3.5" height="3.5" rx=".6" /><rect x="13" y="7.5" width="3.5" height="3.5" rx=".6" /><rect x="7.5" y="13" width="3.5" height="3.5" rx=".6" /><path d="M13 13h1.8v1.8M16.5 16.5H15M16.5 13v.01" /></svg>
);
const LinkI = () => <svg {...sv} width={22} height={22}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg>;
const History = () => <svg {...sv} width={26} height={26}><path d="M3.8 12a8.2 8.2 0 1 0 2.5-5.9L3.8 8.6" /><path d="M3.8 4v4.6h4.6" /><path d="M12 7.6V12l3 1.8" /></svg>;
const Sliders = () => <svg {...sv} width={26} height={26}><path d="M4 8h5M15 8h5M4 16h9M19 16h1" /><circle cx="12" cy="8" r="2.6" /><circle cx="16" cy="16" r="2.6" /></svg>;

const POINTS = [
  { icon: <History />, title: 'Change history', text: 'All updates made to the record.' },
  { icon: <Icon name="shield" size={26} />, title: 'Integrity', text: 'Confirms that no event was changed or removed.' },
  { icon: <Sliders />, title: 'Evidence type', text: 'Shows that the record is tamper-evident, not tamper-proof.' },
];

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Verify a record' };

export default async function VerifyHome({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const sp = await searchParams;
  const id = (sp.id ?? '').trim();
  const db = await getDb();
  const examples = (await listRecords(db)).slice(0, 3).map((r) => r.id);

  let body: React.ReactNode = null;
  if (id) {
    const v = await getRecordView(db, id);
    if (!v) {
      body = (
        <div className="rs-result vf-result ask_first" role="status">
          <span className="vf-ico" aria-hidden="true"><Icon name="help" size={34} /></span>
          <p className="r-title">No record found</p>
          <p>No public record matches <strong>{id}</strong>. Check the ID and try again.</p>
        </div>
      );
    } else {
      const res = await verifyRecord(db, id, publicKeys());
      const rows = await auditRows(db, id);
      const ok = res.ok;
      body = (
        <div className={`rs-result vf-result ${ok ? 'permitted' : 'not_permitted'}`} role="status">
          <span className="vf-ico" aria-hidden="true"><Icon name={ok ? 'shield' : 'cross'} size={32} /></span>
          <p className="r-title">{ok ? 'Record Verified' : 'History does not check out'}</p>
          <p>{v.title} · {id}</p>
          <ul className="vf-list">
            <li><Icon name={ok ? 'checkCircle' : 'cross'} size={18} /><span>{ok ? 'No changes found' : `Chain broken at event #${res.brokenAt}`}</span></li>
            <li><Icon name={rows.length > 0 ? 'checkCircle' : 'cross'} size={18} /><span>{rows.length > 0 ? `History available (${rows.length} ${rows.length === 1 ? 'event' : 'events'})` : 'No history available'}</span></li>
            <li><Icon name={ok ? 'checkCircle' : 'cross'} size={18} /><span>{ok ? 'Integrity intact' : 'Integrity not confirmed'}</span></li>
          </ul>
          <p style={{ marginTop: 8 }}>This checks the record’s history, not whether its claims are true.</p>
          <p><a href={`/verify/${id}`}>See full verification <Icon name="arrow" size={14} /></a></p>
        </div>
      );
    }
  }

  return (
    <div className="wrap page reuse-page verify-page">
      <PageSheet eyebrow="Verify Record" title="Verify Record" lede="See the change history and integrity of a cultural record.">
        <div className="studio vf-grid">
          <form method="get" action="/verify" className="rs-card vf-card">
            <div className="rs-card-head">
              <span className="vf-ico"><Qr /></span>
              <div>
                <h2>Enter Record ID</h2>
                <p>Check the authenticity, changes and history of a record.</p>
              </div>
            </div>
            <label htmlFor="rid" className="vf-sr">Record ID</label>
            <div className="vf-field">
              <span className="vf-field-ico"><LinkI /></span>
              <input id="rid" name="id" type="text" defaultValue={id} placeholder="e.g. MDR-2026-0001" autoComplete="off" spellCheck={false} aria-describedby="rid-hint" />
            </div>
            <p className="vf-hint" id="rid-hint">The ID is shown on every Cultural Passport and credit card.</p>
            <div className="rs-actions">
              <button type="submit" className="btn"><Icon name="shield" size={20} />Verify Record<Icon name="arrow" size={18} /></button>
            </div>
            {examples.length > 0 && (
              <div className="vf-samples">
                <p>Try a sample ID:</p>
                <ul>{examples.map((e) => <li key={e}><a href={`/verify?id=${e}`}>{e}</a></li>)}</ul>
              </div>
            )}
          </form>
          <div className="vf-side" aria-live="polite">
            {body ?? (
              <section className="vf-info" aria-label="What a check shows">
                <h2><span className="vf-i"><Icon name="info" size={22} /></span>What a check shows</h2>
                <ul>
                  {POINTS.map((p) => (
                    <li key={p.title}><span className="vf-ico vf-ico-sm">{p.icon}</span><div><h3>{p.title}</h3><p>{p.text}</p></div></li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </PageSheet>
    </div>
  );
}
