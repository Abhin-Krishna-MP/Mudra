import { NextResponse } from 'next/server';
import { getActor } from '@/lib/session';
import { getDb } from '@/lib/db';
import { readSecureKyc } from '@/lib/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await getActor();
  // Strictly enforce admin role
  if (!actor || actor.role !== 'admin') {
    return new NextResponse('Unauthorized: Admin access required', { status: 403 });
  }

  const { id } = await params;
  const db = await getDb();
  const app = (await db.execute('SELECT id_document_url FROM steward_applications WHERE id = ?', [Number(id)])).rows[0];

  if (!app || !app.id_document_url) {
    return new NextResponse('Document not found', { status: 404 });
  }

  const buf = await readSecureKyc(String(app.id_document_url));
  if (!buf) {
    return new NextResponse('Document file not found in secure storage', { status: 404 });
  }

  const loc = String(app.id_document_url);
  let contentType = 'image/jpeg';
  if (loc.startsWith('data:')) {
    const match = loc.match(/^data:([^;]+);/);
    if (match) contentType = match[1];
  } else {
    const cleanPath = loc.split('?')[0].toLowerCase();
    if (cleanPath.endsWith('.pdf')) contentType = 'application/pdf';
    else if (cleanPath.endsWith('.png')) contentType = 'image/png';
    else if (cleanPath.endsWith('.webp')) contentType = 'image/webp';
    else if (cleanPath.endsWith('.gif')) contentType = 'image/gif';
  }

  return new NextResponse(new Uint8Array(buf), {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'private, no-store',
      'Content-Disposition': 'inline',
    },
  });
}
