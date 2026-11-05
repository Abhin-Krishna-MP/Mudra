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
      <div style={{ width: 1200, height: 630, display: 'flex', background: '#f7eedd', color: '#1b1b1b', fontFamily: 'sans-serif' }}>
        {/* Left: the artwork, never cropped, sitting on the cream mat */}
        <div style={{ width: 560, height: 630, background: '#efe3cc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '6px solid #daa017' }}>
          {art ? <img src={art.src} width={art.w} height={art.h} alt="" /> : <div style={{ display: 'flex', fontSize: 24, color: '#5c4b3a' }}>Image withheld</div>}
        </div>
        {/* Right: who it comes from and what it says */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0c3d33', color: '#f7eedd', padding: '18px 40px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <div style={{ display: 'flex', fontSize: 34, fontWeight: 700, color: '#e9b949' }}>Mudra</div>
              <div style={{ display: 'flex', fontSize: 18, marginLeft: 14, color: '#f7eedd' }}>Credit the Culture</div>
            </div>
            <div style={{ display: 'flex', fontSize: 18, color: '#f7eedd' }}>Cultural Passport · {v.id}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', padding: '0 40px', flex: 1, justifyContent: 'center' }}>
            <div style={{ display: 'flex', fontSize: 50, fontWeight: 700, lineHeight: 1.12, color: '#681f1c' }}>{v.title.slice(0, 90)}</div>
            <div style={{ display: 'flex', fontSize: 24, marginTop: 20, color: '#1b1b1b' }}>Credit: {credit.slice(0, 160)}</div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 16 }}>
              <div style={{ display: 'flex', fontSize: 19, color: '#5c4b3a' }}>{v.region}</div>
              <div style={{ display: 'flex', fontSize: 18, fontWeight: 700, marginLeft: 16, padding: '4px 16px', borderRadius: 999, background: '#681f1c', color: '#fff6e5' }}>{lic}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 40px 34px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: 18, color: '#5c4b3a', maxWidth: 330 }}>
              <div style={{ display: 'flex' }}>Scan to see what the creators and the licence say about reuse.</div>
            </div>
            <div style={{ display: 'flex', background: '#ffffff', padding: 8, borderRadius: 12, border: '2px solid #d6c196' }}>
              <img src={qr} width={138} height={138} alt="" />
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
