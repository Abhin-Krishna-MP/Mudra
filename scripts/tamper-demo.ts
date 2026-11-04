/** npm run tamper-demo — in-memory only. Shows verification failing at the edited event, then restoring it. */
import { sqliteDb } from '../src/lib/db/sqlite-adapter';
import { migrate } from '../src/lib/db/schema';
import { createRecord, reviewAction, verifyRecord } from '../src/lib/repo';
import { generateKeyPem } from '../src/lib/signing';

async function main() {
const { priv, pub } = generateKeyPem();
const key = { id: 'demo', privPem: priv }; const pubs = { demo: pub };
const db = sqliteDb(); await migrate(db);
const rev = { role: 'reviewer', name: 'Demo reviewer' };
const { id } = await createRecord(db, {
  title: 'Invented sandbox object', workType: 'sandbox', region: 'Nowhere', culturalContext: 'An abstract invented object used only to demonstrate tamper evidence.',
  contextSources: [], sensitivity: 'public', submissionBasis: 'creator_submitted', licence: 'CC0', licenceSourceNote: 'Made by the team', attributionRequired: false,
  permissions: { share: 'permitted', commercial: 'unspecified', adapt: 'unspecified', ai_training: 'unspecified' },
  credits: [{ name: 'Team Mudra', role: 'Creator' }],
  asset: { location: 'seed/demo-0001.png', mime: 'image/png', alt: 'Abstract pattern', sha256: 'b'.repeat(64), dhash: '0'.repeat(16), width: 1, height: 1, bytes: 1 },
}, { role: 'public', name: 'Submitter' }, { key, id: 'MDR-DEMO-0001', isDemo: true });
await reviewAction(db, rev, { recordId: id!, action: 'approve' }, key);
await reviewAction(db, rev, { recordId: id!, action: 'verify', evidence: { source: 'Team notes', note: 'Sandbox' } }, key);

const show = async (label: string) => { const r = await verifyRecord(db, id!, pubs); console.log(`${label}: ${r.ok ? 'OK, chain intact' : `FAILED at event #${r.brokenAt} (${r.reason})`}`); };
await show('1. Original history');
const orig = (await db.execute('SELECT diff_json FROM audit_events WHERE record_id=? AND seq=2', [id])).rows[0].diff_json;
await db.execute('UPDATE audit_events SET diff_json=? WHERE record_id=? AND seq=2', [JSON.stringify({ status: 'removed' }), id]);
await show('2. After editing event #2 directly in the database');
await db.execute('UPDATE audit_events SET diff_json=? WHERE record_id=? AND seq=2', [orig, id]);
await show('3. After restoring event #2');
console.log('\nTamper-evident, not tamper-proof: an edit is revealed, not prevented.');

}
main().catch((e) => { console.error(e); process.exit(1); });
