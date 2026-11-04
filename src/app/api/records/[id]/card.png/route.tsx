import React from 'react';
import { ImageResponse } from 'next/og';
import QRCode from 'qrcode';
import sharp from 'sharp';
import { getDb } from '@/lib/db';
import { getRecordView } from '@/lib/repo';
import { LICENCES } from '@/lib/permissions';
import { recordUrl } from '@/lib/site';
import { readLocalAsset } from '@/lib/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const v = await getRecordView(await getDb(), id);
  if (!v) return new Response('Not found', { status: 404 });

  let art: { src: string; w: number; h: number } | null = null;
  if (v.asset?.displayUrl) {
    const row = (await (await getDb()).execute('SELECT location FROM assets WHERE record_id = ?', [id])).rows[0];
    const loc = String(row?.location ?? '');
    let buf: Buffer | null = null;
    if (/^https?:\/\//.test(loc)) { const r = await fetch(loc); buf = r.ok ? Buffer.from(await r.arrayBuffer()) : null; } else buf = await readLocalAsset(loc);
    if (buf) {
      // Uncropped: fit inside the mat, keep aspect ratio. Satori needs PNG/JPEG.
      const { data, info } = await sharp(buf).resize(520, 520, { fit: 'inside', withoutEnlargement: true }).png().toBuffer({ resolveWithObject: true });
      art = { src: `data:image/png;base64,${data.toString('base64')}`, w: info.width, h: info.height };
    }
  }
  const qr = await QRCode.toDataURL(recordUrl(v.id), { margin: 1, width: 200, errorCorrectionLevel: 'M' });
  const credit = v.credits.map((c) => `${c.name} (${c.role})`).join(' · ') || 'Creators not yet credited';
  const lic = LICENCES[v.licence].label;

  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: 'flex', background: '#faf6ee', color: '#1f1b16', fontFamily: 'sans-serif' }}>
        <div style={{ width: 560, height: 630, background: '#efe7d8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {art ? <img src={art.src} width={art.w} height={art.h} alt="" /> : <div style={{ display: 'flex', fontSize: 24, color: '#5a5147' }}>Image withheld</div>}
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 40, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 22, color: '#5a5147' }}>Mudra · Cultural Passport · {v.id}</div>
            <div style={{ display: 'flex', fontSize: 44, fontWeight: 700, marginTop: 12, lineHeight: 1.15 }}>{v.title.slice(0, 90)}</div>
            <div style={{ display: 'flex', fontSize: 24, marginTop: 20 }}>Credit: {credit.slice(0, 160)}</div>
            <div style={{ display: 'flex', fontSize: 20, marginTop: 10, color: '#5a5147' }}>{v.region} · Image licence: {lic}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: 18, color: '#5a5147', maxWidth: 330 }}>
              <div style={{ display: 'flex' }}>Scan to see what the creators and the licence say about reuse.</div>
            </div>
            <img src={qr} width={150} height={150} alt="" />
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
