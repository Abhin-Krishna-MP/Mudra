import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { findMatches } from '@/lib/repo';
import { processImage } from '@/lib/imagehash';
export const runtime = 'nodejs';

// Best-effort limiter (in memory, per instance): 20 checks per minute per IP.
const hits = new Map<string, number[]>();
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  if (recent.length >= 20) return NextResponse.json({ error: 'Too many checks. Please wait a minute.' }, { status: 429 });
  hits.set(ip, [...recent, now]);
  const fd = await req.formData();
  const f = fd.get('file');
  if (!(f instanceof File)) return NextResponse.json({ error: 'Attach an image file.' }, { status: 400 });
  try {
    const p = await processImage(Buffer.from(await f.arrayBuffer())); // hashed in memory, never stored
    return NextResponse.json(await findMatches(await getDb(), p.sha256, p.dhash));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
