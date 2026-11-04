import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { sqliteDb } from '../src/lib/db/sqlite-adapter';
import { migrate } from '../src/lib/db/schema';
import {
  createRecord, nextRecordId, reviewAction, submitFlag, verifyRecord, getRecordView, listRecords,
  getAsset, getTimeline, auditRows, listFlags, type CreateInput,
} from '../src/lib/repo';
import { AuthError } from '../src/lib/auth';

const kp = generateKeyPairSync('ed25519');
const key = { id: 'k1', privPem: kp.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString() };
const pubs = { k1: kp.publicKey.export({ type: 'spki', format: 'pem' }).toString() };

async function fresh() { const db = sqliteDb(); await migrate(db); return db; }
const reviewer = { role: 'reviewer', name: 'Asha (reviewer)' };
const input = (o: Partial<CreateInput> = {}): CreateInput => ({
  title: 'Invented sandbox object', workType: 'sandbox', region: 'Nowhere', culturalContext: 'An abstract invented object used only for testing the system.',
  contextSources: [], sensitivity: 'public', submissionBasis: 'creator_submitted', licence: 'CC0', licenceSourceNote: 'Made by the team',
  attributionRequired: false,
  permissions: { share: 'permitted', commercial: 'unspecified', adapt: 'unspecified', ai_training: 'unspecified' },
  credits: [{ name: 'Team Mudra', role: 'Creator' }, { name: 'Community X', role: 'Custodian', collective: true }],
  asset: { location: 'seed/x.png', mime: 'image/png', alt: 'An abstract pattern', sha256: 'a'.repeat(64), dhash: '0'.repeat(16), width: 10, height: 10, bytes: 100 },
  ...o,
});

test('ID generation is unique under concurrent inserts', async () => {
  const db = await fresh();
  const ids = await Promise.all(Array.from({ length: 40 }, () => nextRecordId(db)));
  assert.equal(new Set(ids).size, 40);
  assert.match(ids[0], /^MDR-2026-\d{4}$/);
});

test('create: field errors, then one transaction producing record+credits+asset+event #1 (pending)', async () => {
  const db = await fresh();
  const bad = await createRecord(db, input({ title: 'x', credits: [], asset: { ...input().asset, alt: '' } }), { role: 'public', name: 'Submitter' });
  assert.equal(bad.ok, false);
  assert.ok(bad.fieldErrors!.title && bad.fieldErrors!.credits && bad.fieldErrors!.alt);
  assert.equal((await listRecords(db, { reviewer: true })).length, 0);

  const r = await createRecord(db, input(), { role: 'public', name: 'Submitter' }, { key });
  assert.ok(r.ok && r.id);
  const v = await getRecordView(db, r.id!, { reviewer: true });
  assert.equal(v!.status, 'pending');
  assert.equal(v!.credits.length, 2);
  assert.equal((await auditRows(db, r.id!)).length, 1);
  assert.equal(await getRecordView(db, r.id!), null, 'pending records are not public');
});

test('honeypot drops bot submissions without storing', async () => {
  const db = await fresh();
  await createRecord(db, input({ honeypot: 'spam' }), { role: 'public', name: 'bot' });
  assert.equal((await db.execute('SELECT COUNT(*) AS n FROM records')).rows[0].n, 0);
});

test('role guards: every reviewer action rejects unauthenticated (401) and wrong role (403)', async () => {
  const db = await fresh();
  const r = await createRecord(db, input(), { role: 'public', name: 'S' });
  const id = r.id!;
  const actions = [
    { recordId: id, action: 'approve' as const },
    { recordId: id, action: 'needsChanges' as const },
    { recordId: id, action: 'remove' as const },
    { recordId: id, action: 'verify' as const, evidence: { source: 's', note: 'n' } },
    { recordId: id, action: 'resolveFlag' as const, flagId: 'x', note: 'n' },
  ];
  for (const a of actions) {
    await assert.rejects(() => reviewAction(db, null, a), (e: any) => e instanceof AuthError && e.status === 401);
    await assert.rejects(() => reviewAction(db, { role: 'public', name: 'x' }, a), (e: any) => e instanceof AuthError && e.status === 403);
  }
  await assert.rejects(() => listFlags(db, null), (e: any) => e.status === 401);
});

test('full governance loop: submit → approve → flag → resolve → verify, chain passes on real rows (signed)', async () => {
  const db = await fresh();
  const id = (await createRecord(db, input(), { role: 'public', name: 'S' }, { key })).id!;
  assert.ok((await reviewAction(db, reviewer, { recordId: id, action: 'approve' }, key)).ok);
  assert.equal((await getRecordView(db, id))!.status, 'published');

  const f = await submitFlag(db, { recordId: id, type: 'missing_attribution', text: 'The credit is missing on a shop page.', contact: 'me@example.com' }, key);
  assert.ok(f.ok);
  assert.equal((await getRecordView(db, id))!.disputed, true);

  // privacy: reporter contact and flag text never reach public views or audit diffs
  const rows = await auditRows(db, id);
  const blob = JSON.stringify(rows) + JSON.stringify(await getRecordView(db, id)) + JSON.stringify(await getTimeline(db, id, pubs));
  assert.ok(!blob.includes('me@example.com') && !blob.includes('shop page'));

  assert.ok((await reviewAction(db, reviewer, { recordId: id, action: 'resolveFlag', flagId: f.id!, note: 'Credit added.' }, key)).ok);
  assert.equal((await getRecordView(db, id))!.disputed, false);
  assert.equal((await reviewAction(db, reviewer, { recordId: id, action: 'verify', evidence: { source: '' , note: '' } }, key)).ok, false, 'verify needs evidence');
  assert.ok((await reviewAction(db, reviewer, { recordId: id, action: 'verify', evidence: { source: 'Custodian email', url: 'https://example.org', note: 'Confirmed credits.' } }, key)).ok);
  assert.equal((await getRecordView(db, id))!.verificationLevel, 'verified');

  const res = await verifyRecord(db, id, pubs);
  assert.equal(res.ok, true);
  assert.equal(res.events.length, 5); // create, approve, flag_opened, flag_resolved, verify
});

test('tampering with a stored row is reported at the edited seq; unsigned history still verifies', async () => {
  const db = await fresh();
  const id = (await createRecord(db, input(), { role: 'public', name: 'S' }, { publishAs: reviewer })).id!; // unsigned
  await reviewAction(db, reviewer, { recordId: id, action: 'verify', evidence: { source: 's', note: 'n' } }, key); // signed later
  assert.equal((await verifyRecord(db, id, pubs)).ok, true);
  await db.execute("UPDATE audit_events SET diff_json = '{\"status\":\"removed\"}' WHERE record_id = ? AND seq = 2", [id]);
  const r = await verifyRecord(db, id, pubs);
  assert.ok(!r.ok && r.brokenAt === 2);
});

test('restricted: image hidden from public (incl. asset endpoint), visible to reviewers', async () => {
  const db = await fresh();
  const id = (await createRecord(db, input({ sensitivity: 'restricted' }), { role: 'public', name: 'S' }, { publishAs: reviewer })).id!;
  const pub = await getRecordView(db, id);
  assert.equal(pub!.asset!.displayUrl, null);
  const rev = await getRecordView(db, id, { reviewer: true });
  assert.ok(rev!.asset!.displayUrl);
  const assetId = rev!.asset!.displayUrl!.split('/').pop()!;
  assert.equal(await getAsset(db, assetId), null);
  assert.ok(await getAsset(db, assetId, { reviewer: true }));
  assert.equal((await listRecords(db))[0].thumbUrl, null);
});
