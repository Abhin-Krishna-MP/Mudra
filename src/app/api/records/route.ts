import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { listRecords } from '@/lib/repo';
import { searchRecords } from '@/lib/search';
export const dynamic = 'force-dynamic';
export async function GET(req: Request) {
  const u = new URL(req.url);
  const all = await listRecords(await getDb());
  const items = searchRecords(all, u.searchParams.get('q') ?? '', { region: u.searchParams.get('region') || undefined, workType: u.searchParams.get('type') || undefined });
  return NextResponse.json({ items, total: items.length });
}
