import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getRecordView, verifyRecord } from '@/lib/repo';
import { publicKeys } from '@/lib/signing';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const db = await getDb();
  if (!(await getRecordView(db, id))) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(await verifyRecord(db, id, publicKeys()));
}
