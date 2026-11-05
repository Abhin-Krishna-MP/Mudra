import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { signingKey } from '@/lib/signing';
import { createHash, sign, createPrivateKey } from 'node:crypto';
import canonicalize from 'canonicalize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const db = await getDb();
  const k = signingKey();

  const rows = (await db.execute(
    `SELECT r.id, r.title, r.perm_ai_training, r.perm_commercial, r.licence,
            a.sha256, a.dhash,
            (SELECT hash FROM audit_events WHERE record_id = r.id ORDER BY seq DESC LIMIT 1) as latest_audit_hash
     FROM records r
     LEFT JOIN assets a ON a.record_id = r.id
     WHERE r.status = 'published' AND r.sensitivity != 'restricted'
     ORDER BY r.id`,
  )).rows;

  const now = new Date().toISOString();

  const manifest = {
    version: 1,
    generated_at: now,
    key_id: k?.id || 'unsigned',
    records_count: rows.length,
    records: rows.map((r) => ({
      id: String(r.id),
      title: String(r.title),
      sha256: r.sha256 ? String(r.sha256) : null,
      dhash: r.dhash ? String(r.dhash) : null,
      ai_training: String(r.perm_ai_training),
      commercial: String(r.perm_commercial),
      licence: String(r.licence),
      latest_audit_hash: r.latest_audit_hash ? String(r.latest_audit_hash) : null,
    })),
  };

  let signature: string | null = null;
  if (k) {
    const canonical = canonicalize(manifest)!;
    const hash = createHash('sha256').update(canonical).digest();
    signature = sign(null, hash, createPrivateKey(k.privPem)).toString('base64');
  }

  return NextResponse.json(
    {
      manifest,
      signature,
      signature_algorithm: 'Ed25519 over SHA-256 of canonical JSON (RFC 8785)',
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=1800',
      },
    },
  );
}
