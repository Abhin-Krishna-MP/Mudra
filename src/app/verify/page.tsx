import { getDb } from '@/lib/db';
import { listRecords, getRecordView, verifyRecord, auditRows } from '@/lib/repo';
import { publicKeys } from '@/lib/signing';
import { PageSheet } from '@/components/PageSheet';
import { Icon } from '@/components/Icons';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Verify a record' };

export default async function VerifyHome({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const sp = await searchParams;
  const id = (sp.id ?? '').trim();
  const db = await getDb();
  const examples = id ? [] : (await listRecords(db)).slice(0, 3).map((r) => r.id);

  let body: React.ReactNode = null;
  if (id) {
    const v = await getRecordView(db, id);
    if (!v) {
      body = (
        <div className="result-card ask_first" role="status">
          <span className="r-ico" aria-hidden="true"><Icon name="help" size={34} /></span>
          <p className="r-title">No record found</p>
          <p>No public record matches <strong>{id}</strong>. Check the ID and try again.</p>
        </div>
      );
    } else {
      const res = await verifyRecord(db, id, publicKeys());
      const rows = await auditRows(db, id);
      const ok = res.ok;
      body = (
        <div className={`result-card ${ok ? 'permitted' : 'not_permitted'}`} role="status">
          <span className="r-ico" aria-hidden="true"><Icon name={ok ? 'shield' : 'cross'} size={32} /></span>
          <p className="r-title">{ok ? 'Record Verified' : 'History does not check out'}</p>
          <p>{v.title} · {id}</p>
          <ul>
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
    <div className="wrap page">
      <PageSheet title="Verify Record" lede="See the change history and integrity of a cultural record.">
        <div className="studio ui">
          <form method="get" action="/verify">
            <label htmlFor="rid" style={{ marginTop: 0 }}>Enter Record ID</label>
            <input id="rid" name="id" type="text" defaultValue={id} placeholder="e.g. MDR-2026-0001" autoComplete="off" spellCheck={false} aria-describedby="rid-hint" />
            <p className="hint" id="rid-hint">The ID is shown on every Cultural Passport and credit card.</p>
            <div className="btn-row"><button type="submit" className="wide">Verify</button></div>
            {examples.length > 0 && <p className="hint" style={{ marginTop: 14 }}>Try: {examples.map((e, i) => <span key={e}>{i > 0 && ', '}<a href={`/verify?id=${e}`}>{e}</a></span>)}</p>}
          </form>
          <div aria-live="polite">
            {body ?? (
              <div className="panel" style={{ margin: 0 }}>
                <h3>What a check shows</h3>
                <p>Every change to a record is written to a hash-linked history. A check confirms that no event was changed or removed after the fact.</p>
                <p className="hint">Tamper-evident, not tamper-proof. It does not show that the claims in a record are true.</p>
              </div>
            )}
          </div>
        </div>
      </PageSheet>
    </div>
  );
}
