import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getRequestByToken } from '@/lib/repo-grants';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    if (!token || typeof token !== 'string') {
      return NextResponse.json({ ok: false, error: 'Token is required' }, { status: 400 });
    }
    const db = await getDb();
    const req = await getRequestByToken(db, token);
    if (!req) {
      return NextResponse.json({ ok: false, error: 'Request not found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, request: req });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

