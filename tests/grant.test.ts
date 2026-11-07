import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPem } from '../src/lib/signing';
import { buildGrantPayload, signGrant, verifyGrant } from '../src/lib/grant';
import { sqliteDb } from '../src/lib/db/sqlite-adapter';
import { migrate } from '../src/lib/db/schema';
import { createPermissionRequest, decideRequest, revokeGrant, getRequestByToken, getGrant, assignSteward } from '../src/lib/repo-grants';

const { priv, pub } = generateKeyPem();
const pubs = { k1: pub };

test('valid grant signs and verifies successfully', () => {
  const payload = buildGrantPayload({
    grant_id: 'G-001',
    record_id: 'MDR-2026-0001',
    record_audit_head: '0'.repeat(64),
    use_key: 'print_merch',
    scope: { whatYouWillMake: 'T-shirt print', whereAndHowLong: 'Kerala, 1 season' },
    conditions: ['Display credit alongside print'],
    credit_text: 'Courtesy of Community Stewards',
    valid_from: new Date(Date.now() - 3600_000).toISOString(),
    valid_until: new Date(Date.now() + 86400_000).toISOString(),
    steward_display: 'Mudra Reviewer',
    steward_verification: 'Verified against team records',
    issued_at: new Date().toISOString(),
    key_id: 'k1',
  });

  const signed = signGrant(payload, priv);
  const res = verifyGrant(signed, pubs);
  assert.equal(res.ok, true);
  if (res.ok) {
    assert.equal(res.status, 'active');
  }
});

test('altering one byte of the payload fails verification', () => {
  const payload = buildGrantPayload({
    grant_id: 'G-002',
    record_id: 'MDR-2026-0001',
    record_audit_head: '0'.repeat(64),
    use_key: 'print_merch',
    scope: { whatYouWillMake: 'Posters', whereAndHowLong: 'Online' },
    conditions: [],
    credit_text: '',
    valid_from: new Date(Date.now() - 3600_000).toISOString(),
    valid_until: null,
    steward_display: 'Steward',
    steward_verification: 'Note',
    issued_at: new Date().toISOString(),
    key_id: 'k1',
  });

  const signed = signGrant(payload, priv);

  // Alter one letter in whatYouWillMake
  const tamperedPayload = {
    ...signed.payload,
    scope: { ...signed.payload.scope, whatYouWillMake: 'Toasters' },
  };

  const res = verifyGrant({ payload: tamperedPayload, signature: signed.signature }, pubs);
  assert.equal(res.ok, false);
  if (!res.ok) {
    assert.match(res.reason, /Signature does not match/);
  }
});

test('expired grant verifies signature but reports expired status', () => {
  const payload = buildGrantPayload({
    grant_id: 'G-003',
    record_id: 'MDR-2026-0001',
    record_audit_head: '0'.repeat(64),
    use_key: 'print_merch',
    scope: { whatYouWillMake: 'Cards', whereAndHowLong: '1 week' },
    conditions: [],
    credit_text: '',
    valid_from: new Date(Date.now() - 86400_000 * 10).toISOString(),
    valid_until: new Date(Date.now() - 86400_000 * 2).toISOString(), // expired 2 days ago
    steward_display: 'Steward',
    steward_verification: 'Note',
    issued_at: new Date(Date.now() - 86400_000 * 10).toISOString(),
    key_id: 'k1',
  });

  const signed = signGrant(payload, priv);
  const res = verifyGrant(signed, pubs);
  assert.equal(res.ok, true);
  if (res.ok) {
    assert.equal(res.status, 'expired');
  }
});

test('end-to-end Ask → Grant workflow with SQLite', async () => {
  const db = sqliteDb();
  await migrate(db);

  // Create test user and record
  await db.execute(`INSERT INTO users (id, email, name, role, password_hash) VALUES (1, 'steward@test.org', 'Test Steward', 'reviewer', 'hash')`);
  await db.execute(`INSERT INTO records (id, title, work_type, region, cultural_context, submission_basis, licence, status, created_at)
                    VALUES ('MDR-2026-TEST', 'Test Cultural Work', 'ritual', 'Kerala', 'Context', 'creator_submitted', 'CC-BY-4.0', 'published', '2026-01-01T00:00:00Z')`);

  const key = { id: 'k1', privPem: priv };

  // 1. Request when no steward is assigned -> auto-forwarded
  const req1 = await createPermissionRequest(db, {
    recordId: 'MDR-2026-TEST',
    useKey: 'print_merch',
    requesterName: 'Aline Designer',
    requesterContact: 'aline@example.com',
    whatYouWillMake: 'Postcard print',
    whereAndHowLong: 'Local fair',
  }, key);

  assert.equal(req1.ok, true);
  if (req1.ok) {
    const status1 = await getRequestByToken(db, req1.token);
    assert.equal(status1?.status, 'forwarded');

    // Verify audit event
    const events = (await db.execute(`SELECT * FROM audit_events WHERE record_id = 'MDR-2026-TEST'`)).rows;
    assert.equal(events.length, 1);
    assert.equal(events[0].action, 'permission_forwarded');
    // Ensure requester contact is NEVER in the diff JSON
    assert.doesNotMatch(String(events[0].diff_json), /aline@example\.com/);
  }

  // 2. Assign steward to record
  const adminActor = { role: 'admin', name: 'Admin' };
  await assignSteward(db, adminActor, 'MDR-2026-TEST', 1);

  // 3. Request when steward IS assigned -> stays open
  const req2 = await createPermissionRequest(db, {
    recordId: 'MDR-2026-TEST',
    useKey: 'print_merch',
    requesterName: 'Kiran Reuser',
    requesterContact: 'kiran@example.com',
    whatYouWillMake: 'Handmade notebook cover',
    whereAndHowLong: 'Kerala, 2026',
  }, key);

  assert.equal(req2.ok, true);
  if (req2.ok) {
    const status2 = await getRequestByToken(db, req2.token);
    assert.equal(status2?.status, 'open');

    // 4. Steward grants request
    const stewardActor = { role: 'reviewer', name: 'Test Steward' };
    const decRes = await decideRequest(db, stewardActor, {
      requestId: req2.requestId,
      decision: 'granted',
      note: 'Granted for small handmade series.',
      conditions: ['Include credit line', 'Max 200 copies'],
      creditText: 'Mudra / Test Cultural Work',
      validFrom: new Date(Date.now() - 60_000).toISOString(),
    }, key);

    assert.equal(decRes.ok, true);
    assert.ok(decRes.grantId);

    // 5. Verify grant record
    const grant = await getGrant(db, decRes.grantId!);
    assert.ok(grant);
    assert.equal(grant?.status, 'active');
    assert.equal(grant?.signed.payload.use_key, 'print_merch');

    // 6. Revoke grant
    await revokeGrant(db, stewardActor, req2.requestId, 'Revoking test permission', key);
    const revokedGrant = await getGrant(db, decRes.grantId!);
    assert.equal(revokedGrant?.status, 'revoked');

    // 7. Duplicate request from same email on same record must be rejected
    const reqDuplicate = await createPermissionRequest(db, {
      recordId: 'MDR-2026-TEST',
      useKey: 'commercial_remix',
      requesterName: 'Aline Designer Duplicate',
      requesterContact: 'aline@example.com',
      whatYouWillMake: 'Duplicate attempt',
      whereAndHowLong: 'Online',
    }, key);
    assert.equal(reqDuplicate.ok, false);
    if (!reqDuplicate.ok) {
      assert.match(reqDuplicate.error, /already been submitted/i);
    }
  }
});
