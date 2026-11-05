/**
 * Grant payload building, signing, and verification.
 * ONE function (buildGrantPayload) constructs the payload for both signing and verifying.
 * Grants are recorded statements, NOT legal contracts.
 */
import { createHash, sign, verify, createPrivateKey, createPublicKey } from 'node:crypto';
import canonicalize from 'canonicalize';

export type GrantStatus = 'active' | 'expired' | 'revoked';

export interface GrantPayload {
  v: 1;
  grant_id: string;
  record_id: string;
  record_audit_head: string;
  use_key: string;
  scope: Record<string, string>;
  conditions: string[];
  credit_text: string;
  valid_from: string;
  valid_until: string | null;
  steward_display: string;
  steward_verification: string;
  issued_at: string;
  key_id: string;
}

export interface SignedGrant {
  payload: GrantPayload;
  signature: string; // base64 over SHA-256(canonical JSON of payload)
}

/** Build the grant payload from named fields — the ONLY source of truth for what is signed. */
export function buildGrantPayload(fields: {
  grant_id: string;
  record_id: string;
  record_audit_head: string;
  use_key: string;
  scope: Record<string, string>;
  conditions: string[];
  credit_text: string;
  valid_from: string;
  valid_until: string | null;
  steward_display: string;
  steward_verification: string;
  issued_at: string;
  key_id: string;
}): GrantPayload {
  return { v: 1, ...fields };
}

export function signGrant(payload: GrantPayload, privPem: string): SignedGrant {
  const canonical = canonicalize(payload)!;
  const hash = createHash('sha256').update(canonical).digest();
  const sig = sign(null, hash, createPrivateKey(privPem)).toString('base64');
  return { payload, signature: sig };
}

export type VerifyGrantResult =
  | { ok: true; status: GrantStatus }
  | { ok: false; reason: string };

export function verifyGrant(
  signed: SignedGrant,
  publicKeysPem: Record<string, string>,
): VerifyGrantResult {
  const pub = publicKeysPem[signed.payload.key_id];
  if (!pub) return { ok: false, reason: `Unknown key: ${signed.payload.key_id}` };
  try {
    const canonical = canonicalize(signed.payload)!;
    const hash = createHash('sha256').update(canonical).digest();
    const sigBuf = Buffer.from(signed.signature, 'base64');
    const valid = verify(null, hash, createPublicKey(pub), sigBuf);
    if (!valid) return { ok: false, reason: 'Signature does not match.' };
  } catch {
    return { ok: false, reason: 'Could not verify signature (malformed key or signature).' };
  }
  // Check expiry
  const now = new Date();
  if (new Date(signed.payload.valid_from) > now)
    return { ok: false, reason: 'Grant is not yet valid.' };
  if (signed.payload.valid_until && new Date(signed.payload.valid_until) < now)
    return { ok: true, status: 'expired' };
  return { ok: true, status: 'active' };
}
