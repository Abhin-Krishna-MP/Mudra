import { createHash, sign, verify, createPrivateKey, createPublicKey } from 'node:crypto';
import canonicalize from 'canonicalize';

export const GENESIS = '0'.repeat(64);
export const sha256hex = (s: string | Buffer) => createHash('sha256').update(s).digest('hex');

/** The exact object that is hashed. Nothing else is ever hashed. */
export interface EventPayload {
  record_id: string;
  seq: number;
  actor_role: string;
  actor_name: string;
  action: string;
  diff: unknown;
  created_at: string; // ISO-8601 UTC, stored verbatim
}

/** A row as it comes back from the database. Extra columns are expected and ignored. */
export interface AuditRow {
  id?: number;
  record_id: string;
  seq: number;
  actor_role: string;
  actor_name: string;
  action: string;
  diff_json: string;
  prev_hash: string;
  hash: string;
  signature: string | null;
  key_id: string | null;
  created_at: string;
}

/** ONE function builds the payload, by name. Used when signing AND when verifying. */
export function buildPayload(row: {
  record_id: string;
  seq: number;
  actor_role: string;
  actor_name: string;
  action: string;
  created_at: string;
  diff_json?: string;
  diff?: unknown;
}): EventPayload {
  const diff = row.diff_json !== undefined ? JSON.parse(row.diff_json) : row.diff;
  return {
    record_id: row.record_id,
    seq: row.seq,
    actor_role: row.actor_role,
    actor_name: row.actor_name,
    action: row.action,
    diff,
    created_at: row.created_at,
  };
}

export const hashEvent = (prev: string, p: EventPayload) => sha256hex(prev + canonicalize(p)!);

export const signHash = (hashHex: string, privPem: string) =>
  sign(null, Buffer.from(hashHex, 'hex'), createPrivateKey(privPem)).toString('base64');

export const verifySig = (hashHex: string, sigB64: string, pubPem: string) =>
  verify(null, Buffer.from(hashHex, 'hex'), createPublicKey(pubPem), Buffer.from(sigB64, 'base64'));

/** Build the next event. Call inside the SAME transaction as the change it records. */
export function newEvent(
  input: { record_id: string; seq: number; actor_role: string; actor_name: string; action: string; diff: unknown },
  prevHash: string,
  key: { id: string; privPem: string } | null,
): Omit<AuditRow, 'id'> {
  const created_at = new Date().toISOString(); // generated once...
  const diff = JSON.parse(JSON.stringify(input.diff ?? {})); // ...diff normalised once
  const payload: EventPayload = { ...input, diff, created_at };
  const hash = hashEvent(prevHash, payload);
  return {
    record_id: input.record_id,
    seq: input.seq,
    actor_role: input.actor_role,
    actor_name: input.actor_name,
    action: input.action,
    diff_json: JSON.stringify(diff),
    prev_hash: prevHash,
    hash,
    signature: key ? signHash(hash, key.privPem) : null,
    key_id: key ? key.id : null,
    created_at, // ...and stored verbatim
  };
}

export type EventStatus = { seq: number; hashOk: boolean; sigOk: boolean | null };
export type VerifyResult =
  | { ok: true; latest: string; events: EventStatus[] }
  | { ok: false; brokenAt: number; reason: string; events: EventStatus[] };

/** pubKeys maps key_id -> public key PEM. */
export function verifyChain(rows: AuditRow[], pubKeys: Record<string, string> = {}): VerifyResult {
  const events = [...rows].sort((a, b) => a.seq - b.seq);
  const out: EventStatus[] = [];
  let prev = GENESIS;
  let expected = 1;
  for (const e of events) {
    if (e.seq !== expected) return { ok: false, brokenAt: expected, reason: 'missing or reordered event', events: out };
    if (e.prev_hash !== prev) return { ok: false, brokenAt: e.seq, reason: 'prev_hash mismatch', events: out };
    const hashOk = hashEvent(prev, buildPayload(e)) === e.hash;
    if (!hashOk) return { ok: false, brokenAt: e.seq, reason: 'hash mismatch (content altered)', events: out };
    let sigOk: boolean | null = null; // null = unsigned (signing off)
    if (e.signature) {
      const pub = e.key_id ? pubKeys[e.key_id] : undefined;
      sigOk = !!pub && verifySig(e.hash, e.signature, pub);
      if (!sigOk) return { ok: false, brokenAt: e.seq, reason: 'signature invalid', events: out };
    }
    out.push({ seq: e.seq, hashOk, sigOk });
    prev = e.hash;
    expected++;
  }
  return { ok: true, latest: prev, events: out };
}
