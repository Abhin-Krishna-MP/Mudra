import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { GENESIS, newEvent, verifyChain, type AuditRow } from '../src/lib/chain';

const kp = generateKeyPairSync('ed25519');
const priv = kp.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
const pub = kp.publicKey.export({ type: 'spki', format: 'pem' }).toString();
const key = { id: 'k1', privPem: priv };
const pubs = { k1: pub };

function build(n: number, signed: boolean | boolean[] = false): AuditRow[] {
  const rows: AuditRow[] = [];
  let prev = GENESIS;
  for (let i = 1; i <= n; i++) {
    const s = Array.isArray(signed) ? signed[i - 1] : signed;
    const e = newEvent({ record_id: 'MDR-2026-0001', seq: i, actor_role: 'reviewer', actor_name: 'Asha', action: 'approve', diff: { status: 'published', n: i } }, prev, s ? key : null);
    rows.push({ ...e, id: i + 100 }); // DB-shaped: has id
    prev = e.hash;
  }
  return rows;
}
const dbRoundTrip = (rows: AuditRow[]) => JSON.parse(JSON.stringify(rows)) as AuditRow[];

test('1 valid 3-event chain verifies, signed and unsigned', () => {
  assert.equal(verifyChain(build(3, false)).ok, true);
  const r = verifyChain(build(3, true), pubs);
  assert.equal(r.ok, true);
  assert.ok(r.events.every((e) => e.sigOk === true));
});
test('2 DB-shaped rows (id, key_id, diff_json) verify — regression for the spec bug', () => {
  const r = verifyChain(dbRoundTrip(build(3, true)), pubs);
  assert.equal(r.ok, true);
});
test('3 altered diff_json breaks at that seq', () => {
  const rows = build(3); rows[1].diff_json = JSON.stringify({ status: 'removed' });
  const r = verifyChain(rows);
  assert.ok(!r.ok && r.brokenAt === 2);
});
test('4 altered created_at breaks at that event', () => {
  const rows = build(3); rows[2].created_at = '2020-01-01T00:00:00.000Z';
  const r = verifyChain(rows);
  assert.ok(!r.ok && r.brokenAt === 3);
});
test('5 removed middle event fails; shuffled order still verifies', () => {
  const rows = build(4);
  assert.equal(verifyChain([rows[0], rows[2], rows[3]]).ok, false);
  assert.equal(verifyChain([rows[2], rows[0], rows[3], rows[1]]).ok, true);
});
test('6 signature copied from another event fails; wrong key_id fails', () => {
  const rows = build(3, true);
  rows[1].signature = rows[0].signature;
  const r = verifyChain(rows, pubs);
  assert.ok(!r.ok && r.brokenAt === 2 && r.reason === 'signature invalid');
  const rows2 = build(2, true); rows2[0].key_id = 'nope';
  assert.equal(verifyChain(rows2, pubs).ok, false);
});
test('7 undefined and Date inside diff verify after a JSON round trip', () => {
  const e = newEvent({ record_id: 'R', seq: 1, actor_role: 'x', actor_name: 'y', action: 'z', diff: { a: undefined, d: new Date('2026-01-01T00:00:00Z'), n: 1 } }, GENESIS, null);
  assert.equal(verifyChain(dbRoundTrip([{ ...e, id: 1 }])).ok, true);
});
test('8 mixed chain: early unsigned then signed verifies', () => {
  const r = verifyChain(build(4, [false, false, true, true]), pubs);
  assert.equal(r.ok, true);
  assert.deepEqual(r.events.map((e) => e.sigOk), [null, null, true, true]);
});
