import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAsset } from '@/lib/repo';
import { getActor } from '@/lib/session';
import { readLocalAsset } from '@/lib/storage';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await getActor();
  const reviewer = !!actor && ['reviewer', 'admin'].includes(actor.role);
  const a = await getAsset(await getDb(), id, { reviewer });
  if (!a) return new NextResponse('Not found', { status: 404 });
  if (/^https?:\/\//.test(a.location)) return NextResponse.redirect(a.location);
  const buf = await readLocalAsset(a.location);
  if (!buf) return new NextResponse('Not found', { status: 404 });
  return new NextResponse(new Uint8Array(buf), { headers: { 'Content-Type': a.mime, 'Cache-Control': reviewer ? 'private, no-store' : 'public, max-age=3600' } });
}
