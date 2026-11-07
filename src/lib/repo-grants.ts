/* ============================================================ repo-grants.ts
 * Permission-request and grant functions for the Ask → Grant flow.
 * Imported by actions.ts and pages; keeps repo.ts focused.
 * ============================================================ */
import { randomUUID, createHash } from 'node:crypto';
import type { Db } from './db/types';
import { buildGrantPayload, signGrant, verifyGrant, type SignedGrant, type GrantStatus } from './grant';
import { GENESIS } from './chain';
import { newEvent, type AuditRow } from './chain';
import { requireRole } from './auth';
import type { Actor } from './contracts';

type Key = { id: string; privPem: string } | null;

/* --------------------------------------------------- helpers */
const str = (v: unknown) => String(v ?? '');

function tokenHash(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function newToken() {
  return randomUUID().replace(/-/g, '') + randomUUID().replace(/-/g, '');
}

async function lastEventFor(db: Db, recordId: string) {
  const r = (await db.execute('SELECT seq, hash FROM audit_events WHERE record_id = ? ORDER BY seq DESC LIMIT 1', [recordId])).rows[0];
  return r ? { seq: Number(r.seq), hash: str(r.hash) } : { seq: 0, hash: GENESIS };
}

/* =========================================================== stewards */

export async function getStewardsForRecord(db: Db, recordId: string) {
  const rows = (await db.execute(
    `SELECT u.id, u.name, u.email FROM record_stewards rs JOIN users u ON u.id = rs.user_id WHERE rs.record_id = ?`,
    [recordId],
  )).rows;
  return rows.map((r) => ({ id: Number(r.id), name: str(r.name), email: str(r.email) }));
}

export async function assignSteward(db: Db, actor: Actor | null, recordId: string, userId: number) {
  requireRole(actor, ['reviewer', 'admin', 'steward']);
  await db.execute(
    `INSERT OR IGNORE INTO record_stewards (record_id, user_id) VALUES (?,?)`,
    [recordId, userId],
  );
}

export async function removeSteward(db: Db, actor: Actor | null, recordId: string, userId: number) {
  requireRole(actor, ['reviewer', 'admin', 'steward']);
  await db.execute(`DELETE FROM record_stewards WHERE record_id = ? AND user_id = ?`, [recordId, userId]);
}

/* =========================================================== permission requests */

export interface RequestInput {
  recordId: string;
  useKey: string;
  requesterName: string;
  requesterContact: string; // private — never put in audit diffs
  whatYouWillMake: string;
  whereAndHowLong: string;
  honeypot?: string;
}

export interface PermissionRequestRow {
  id: string;
  record_id: string;
  use_key: string;
  scope_json: string;
  requester_name: string;
  status: string;
  decision_note: string;
  conditions_json: string;
  credit_text: string;
  valid_from: string | null;
  valid_until: string | null;
  token_hash: string;
  created_at: string;
  decided_at: string | null;
}

export interface RequestView extends Omit<PermissionRequestRow, 'token_hash'> {
  scope: { whatYouWillMake: string; whereAndHowLong: string };
  conditions: string[];
  grantId: string | null;
}

export async function createPermissionRequest(
  db: Db,
  input: RequestInput,
  key: Key,
): Promise<{ ok: true; token: string; requestId: string } | { ok: false; error: string }> {
  // Honeypot
  if (input.honeypot) return { ok: false, error: 'Invalid submission.' };
  // Basic validation
  if (!input.requesterName.trim()) return { ok: false, error: 'Your name is required.' };
  if (!input.requesterContact.trim()) return { ok: false, error: 'Contact is required (kept private).' };
  if (!input.whatYouWillMake.trim()) return { ok: false, error: 'Describe what you will make.' };
  if (!input.whereAndHowLong.trim()) return { ok: false, error: 'Describe where you will use it and for how long.' };

  // Check record exists and is published
  const rec = (await db.execute(`SELECT id, status FROM records WHERE id = ? AND status = 'published'`, [input.recordId])).rows[0];
  if (!rec) return { ok: false, error: 'Record not found or not published.' };

  // Single request per email ID per catalogue item constraint
  const contactClean = input.requesterContact.trim().toLowerCase();
  const existingForEmail = (await db.execute(
    `SELECT id FROM permission_requests WHERE record_id = ? AND LOWER(requester_contact) = ? LIMIT 1`,
    [input.recordId, contactClean],
  )).rows[0];
  if (existingForEmail) {
    return {
      ok: false,
      error: 'A permission request has already been submitted for this catalogue item using this email address. Please use your request token to check its status in the Request Status tab.',
    };
  }

  // Rate limit: at most 10 open requests per record
  const existing = (await db.execute(
    `SELECT COUNT(*) as n FROM permission_requests WHERE record_id = ? AND status = 'open'`,
    [input.recordId],
  )).rows[0];
  if (Number(existing?.n) >= 10) return { ok: false, error: 'Too many pending requests for this record.' };

  const id = randomUUID();
  const token = newToken();
  const tHash = tokenHash(token);
  const now = new Date().toISOString();
  const scope = JSON.stringify({ whatYouWillMake: input.whatYouWillMake, whereAndHowLong: input.whereAndHowLong });

  await db.execute(
    `INSERT INTO permission_requests (id, record_id, use_key, scope_json, requester_name, requester_contact, status, token_hash, created_at)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [id, input.recordId, input.useKey, scope, input.requesterName.trim(), input.requesterContact.trim(), 'open', tHash, now],
  );

  // Determine if record has a steward; if not, mark forwarded immediately
  const stewards = await getStewardsForRecord(db, input.recordId);
  if (stewards.length === 0) {
    await db.execute(
      `UPDATE permission_requests SET status = 'forwarded', decided_at = ?, decision_note = ? WHERE id = ?`,
      [now, 'No steward is linked to this record. Your request has been forwarded to the listed contact.', id],
    );
    // Append audit event (no contact info in diff)
    const last = await lastEventFor(db, input.recordId);
    const ev = newEvent(
      { record_id: input.recordId, seq: last.seq + 1, actor_role: 'public', actor_name: input.requesterName.trim(), action: 'permission_forwarded', diff: { request_id: id, use_key: input.useKey } },
      last.hash, key,
    );
    await db.execute(
      `INSERT INTO audit_events (record_id, seq, actor_role, actor_name, action, diff_json, prev_hash, hash, signature, key_id, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [ev.record_id, ev.seq, ev.actor_role, ev.actor_name, ev.action, ev.diff_json, ev.prev_hash, ev.hash, ev.signature, ev.key_id, ev.created_at],
    );
  } else {
    const last = await lastEventFor(db, input.recordId);
    const ev = newEvent(
      { record_id: input.recordId, seq: last.seq + 1, actor_role: 'public', actor_name: input.requesterName.trim(), action: 'permission_requested', diff: { request_id: id, use_key: input.useKey } },
      last.hash, key,
    );
    await db.execute(
      `INSERT INTO audit_events (record_id, seq, actor_role, actor_name, action, diff_json, prev_hash, hash, signature, key_id, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [ev.record_id, ev.seq, ev.actor_role, ev.actor_name, ev.action, ev.diff_json, ev.prev_hash, ev.hash, ev.signature, ev.key_id, ev.created_at],
    );
  }

  return { ok: true, token, requestId: id };
}

export async function getRequestByToken(db: Db, token: string): Promise<RequestView | null> {
  const tHash = tokenHash(token);
  const r = (await db.execute(
    `SELECT pr.*, g.id as grant_id FROM permission_requests pr LEFT JOIN grants g ON g.request_id = pr.id WHERE pr.token_hash = ?`,
    [tHash],
  )).rows[0];
  if (!r) return null;
  return rowToView(r);
}

export async function getRequestById(db: Db, id: string): Promise<RequestView | null> {
  const r = (await db.execute(
    `SELECT pr.*, g.id as grant_id FROM permission_requests pr LEFT JOIN grants g ON g.request_id = pr.id WHERE pr.id = ?`,
    [id],
  )).rows[0];
  if (!r) return null;
  return rowToView(r);
}

function rowToView(r: Record<string, unknown>): RequestView {
  return {
    id: str(r.id), record_id: str(r.record_id), use_key: str(r.use_key),
    scope_json: str(r.scope_json),
    scope: (() => { try { return JSON.parse(str(r.scope_json)); } catch { return {}; } })(),
    requester_name: str(r.requester_name), status: str(r.status),
    decision_note: str(r.decision_note), conditions_json: str(r.conditions_json),
    conditions: (() => { try { return JSON.parse(str(r.conditions_json)); } catch { return []; } })(),
    credit_text: str(r.credit_text), valid_from: r.valid_from ? str(r.valid_from) : null,
    valid_until: r.valid_until ? str(r.valid_until) : null,
    created_at: str(r.created_at), decided_at: r.decided_at ? str(r.decided_at) : null,
    grantId: r.grant_id ? str(r.grant_id) : null,
  };
}

export async function listRequestsForSteward(db: Db, actor: Actor | null): Promise<RequestView[]> {
  requireRole(actor, ['reviewer', 'admin', 'steward']);
  const rows = (await db.execute(
    `SELECT pr.*, g.id as grant_id FROM permission_requests pr LEFT JOIN grants g ON g.request_id = pr.id ORDER BY pr.created_at DESC`,
  )).rows;
  return rows.map(rowToView);
}

/* =========================================================== grant / decline */

export interface DecisionInput {
  requestId: string;
  decision: 'granted' | 'declined';
  note: string;
  conditions: string[];
  creditText: string;
  validFrom: string;
  validUntil?: string;
}

export async function decideRequest(
  db: Db,
  actor: Actor | null,
  input: DecisionInput,
  key: Key,
): Promise<{ ok: true; grantId?: string } | { ok: false; error: string }> {
  requireRole(actor, ['reviewer', 'admin', 'steward']);
  const req = await getRequestById(db, input.requestId);
  if (!req) return { ok: false, error: 'Request not found.' };
  if (req.status !== 'open') return { ok: false, error: `Request is already ${req.status}.` };

  const now = new Date().toISOString();
  await db.execute(
    `UPDATE permission_requests SET status = ?, decided_at = ?, decision_note = ?, conditions_json = ?, credit_text = ?, valid_from = ?, valid_until = ? WHERE id = ?`,
    [input.decision, now, input.note, JSON.stringify(input.conditions), input.creditText, input.validFrom, input.validUntil ?? null, input.requestId],
  );

  let grantId: string | undefined;
  if (input.decision === 'granted' && key) {
    grantId = await issueGrant(db, req, input, now, key);
  }

  // Audit event (no requester contact in diff)
  const last = await lastEventFor(db, req.record_id);
  const action = input.decision === 'granted' ? 'permission_granted' : 'permission_declined';
  const ev = newEvent(
    { record_id: req.record_id, seq: last.seq + 1, actor_role: actor!.role, actor_name: actor!.name, action, diff: { request_id: input.requestId, conditions: input.conditions } },
    last.hash, key,
  );
  await db.execute(
    `INSERT INTO audit_events (record_id, seq, actor_role, actor_name, action, diff_json, prev_hash, hash, signature, key_id, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [ev.record_id, ev.seq, ev.actor_role, ev.actor_name, ev.action, ev.diff_json, ev.prev_hash, ev.hash, ev.signature, ev.key_id, ev.created_at],
  );

  return { ok: true, grantId };
}

async function issueGrant(db: Db, req: RequestView, input: DecisionInput, now: string, key: { id: string; privPem: string }): Promise<string> {
  const grantId = randomUUID();
  // Get latest audit head for the record
  const last = (await db.execute('SELECT hash FROM audit_events WHERE record_id = ? ORDER BY seq DESC LIMIT 1', [req.record_id])).rows[0];
  const auditHead = last ? str(last.hash) : GENESIS;
  const payload = buildGrantPayload({
    grant_id: grantId,
    record_id: req.record_id,
    record_audit_head: auditHead,
    use_key: req.use_key,
    scope: req.scope,
    conditions: input.conditions,
    credit_text: input.creditText,
    valid_from: input.validFrom,
    valid_until: input.validUntil ?? null,
    steward_display: 'Mudra Reviewer',
    steward_verification: 'Reviewed by Mudra cultural records team',
    issued_at: now,
    key_id: key.id,
  });
  const signed = signGrant(payload, key.privPem);
  await db.execute(
    `INSERT INTO grants (id, request_id, record_id, payload_json, signature, key_id, created_at) VALUES (?,?,?,?,?,?,?)`,
    [grantId, req.id, req.record_id, JSON.stringify(signed.payload), signed.signature, key.id, now],
  );
  return grantId;
}

/* =========================================================== get grant */

export interface GrantView {
  id: string;
  record_id: string;
  signed: SignedGrant;
  status: GrantStatus | 'revoked';
  revoked_at: string | null;
  created_at: string;
}

export async function getGrant(db: Db, grantId: string): Promise<GrantView | null> {
  const r = (await db.execute(
    `SELECT g.*, gr.revoked_at FROM grants g LEFT JOIN (SELECT id as req_id, decided_at as revoked_at FROM permission_requests WHERE status = 'revoked') gr ON gr.req_id = g.request_id WHERE g.id = ?`,
    [grantId],
  )).rows[0];
  if (!r) return null;
  const payload = JSON.parse(str(r.payload_json));
  const signed: SignedGrant = { payload, signature: str(r.signature) };
  const revokedAt = r.revoked_at ? str(r.revoked_at) : null;
  const status: GrantView['status'] = revokedAt ? 'revoked' : verifyGrantStatus(signed);
  return { id: grantId, record_id: str(r.record_id), signed, status, revoked_at: revokedAt, created_at: str(r.created_at) };
}

function verifyGrantStatus(signed: SignedGrant): GrantStatus {
  const now = new Date();
  if (new Date(signed.payload.valid_from) > now) return 'expired';
  if (signed.payload.valid_until && new Date(signed.payload.valid_until) < now) return 'expired';
  return 'active';
}

export async function revokeGrant(db: Db, actor: Actor | null, requestId: string, note: string, key: Key) {
  requireRole(actor, ['reviewer', 'admin', 'steward']);
  const req = await getRequestById(db, requestId);
  if (!req) throw new Error('Request not found');
  if (req.status !== 'granted') throw new Error(`Cannot revoke; status is ${req.status}`);
  const now = new Date().toISOString();
  await db.execute(
    `UPDATE permission_requests SET status = 'revoked', decided_at = ?, decision_note = ? WHERE id = ?`,
    [now, note, requestId],
  );
  const last = await lastEventFor(db, req.record_id);
  const ev = newEvent(
    { record_id: req.record_id, seq: last.seq + 1, actor_role: actor!.role, actor_name: actor!.name, action: 'permission_revoked', diff: { request_id: requestId } },
    last.hash, key,
  );
  await db.execute(
    `INSERT INTO audit_events (record_id, seq, actor_role, actor_name, action, diff_json, prev_hash, hash, signature, key_id, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [ev.record_id, ev.seq, ev.actor_role, ev.actor_name, ev.action, ev.diff_json, ev.prev_hash, ev.hash, ev.signature, ev.key_id, ev.created_at],
  );
}
