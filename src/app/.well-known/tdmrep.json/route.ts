import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { siteOrigin } from '@/lib/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const db = await getDb();
  const origin = siteOrigin();

  // Find all published records where AI training is not explicitly permitted
  const rows = (await db.execute(
    `SELECT id, perm_ai_training FROM records WHERE status = 'published' AND perm_ai_training != 'permitted'`,
  )).rows;

  const reservedPaths = rows.map((r) => `/r/${r.id}`);

  const body = {
    'tdm-reservation': 1,
    'tdm-policy': `${origin}/developers#tdm-policy`,
    description:
      'Text and Data Mining reservation signal published per W3C TDMRep Community Group specifications. Mudra publishes the community\'s stated preference; it does not enforce it.',
    reserved_records_count: rows.length,
    policies: [
      {
        'tdm-reservation': 1,
        locations: reservedPaths,
      },
    ],
  };

  return NextResponse.json(body, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
