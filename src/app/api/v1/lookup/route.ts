import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { hamming, classify } from '@/lib/imagehash';
import { siteOrigin, recordUrl } from '@/lib/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// In-memory rate limiter: at most 60 requests per minute per IP
const ipHits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipHits.get(ip) ?? { count: 0, resetAt: now + 60_000 };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + 60_000;
  }
  entry.count += 1;
  ipHits.set(ip, entry);
  return entry.count <= 60;
}

interface LookupQuery {
  sha256?: string;
  dhash?: string;
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded. Try again in one minute.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const queries: LookupQuery[] = Array.isArray(body)
    ? body
    : Array.isArray((body as Record<string, unknown>)?.queries)
      ? (body as { queries: LookupQuery[] }).queries
      : Array.isArray((body as Record<string, unknown>)?.hashes)
        ? (body as { hashes: LookupQuery[] }).hashes
        : [(body as LookupQuery)];

  if (queries.length === 0 || queries.length > 50) {
    return NextResponse.json({ error: 'Provide between 1 and 50 hash queries.' }, { status: 400 });
  }

  const db = await getDb();
  // Fetch all published assets and their record permissions
  const assets = (await db.execute(
    `SELECT a.sha256, a.dhash, r.id, r.title, r.perm_ai_training, r.perm_commercial, r.licence
     FROM assets a
     JOIN records r ON r.id = a.record_id
     WHERE r.status = 'published' AND r.sensitivity != 'restricted'`,
  )).rows;

  const results = queries.map((q) => {
    const qSha = q.sha256?.trim().toLowerCase();
    const qDhash = q.dhash?.trim().toLowerCase();

    // 1. Try exact SHA-256 match
    if (qSha) {
      const exact = assets.find((a) => String(a.sha256).toLowerCase() === qSha);
      if (exact) {
        return {
          query: { sha256: qSha, dhash: qDhash },
          registered: true,
          match_type: 'exact',
          record_id: String(exact.id),
          title: String(exact.title),
          ai_training: String(exact.perm_ai_training),
          commercial: String(exact.perm_commercial),
          licence: String(exact.licence),
          url: `${recordUrl(String(exact.id))}`,
        };
      }
    }

    // 2. Try perceptual dHash match
    if (qDhash && qDhash.length === 16) {
      let closest: (typeof assets)[0] | null = null;
      let minDistance = Infinity;

      for (const a of assets) {
        const d = hamming(String(a.dhash), qDhash);
        if (d < minDistance) {
          minDistance = d;
          closest = a;
        }
      }

      if (closest && classify(minDistance) !== 'none') {
        return {
          query: { sha256: qSha, dhash: qDhash },
          registered: true,
          match_type: 'perceptual',
          distance: minDistance,
          record_id: String(closest.id),
          title: String(closest.title),
          ai_training: String(closest.perm_ai_training),
          commercial: String(closest.perm_commercial),
          licence: String(closest.licence),
          url: `${recordUrl(String(closest.id))}`,
        };
      }
    }

    return {
      query: { sha256: qSha, dhash: qDhash },
      registered: false,
      match_type: 'none',
    };
  });

  return NextResponse.json({
    results,
    count: results.length,
    timestamp: new Date().toISOString(),
  });
}
