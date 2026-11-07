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
      <div style={{ width: 1200, height: 630, display: 'flex', background: '#4a100d', color: '#fff7eb', fontFamily: 'sans-serif' }}>
        {/* Left: the artwork, never cropped, sitting on the rich maroon mat */}
        <div style={{ width: 560, height: 630, background: '#350b09', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '6px solid #e5a93c' }}>
          {art ? <img src={art.src} width={art.w} height={art.h} alt="" /> : <div style={{ display: 'flex', fontSize: 24, color: '#e6c8a5' }}>Image withheld</div>}
        </div>
        {/* Right: who it comes from and what it says */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#4a100d' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#2c0806', borderBottom: '2px solid rgba(229, 169, 60, 0.4)', padding: '18px 40px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <div style={{ display: 'flex', fontSize: 34, fontWeight: 700, color: '#f5c258' }}>Mudra</div>
              <div style={{ display: 'flex', fontSize: 18, marginLeft: 14, color: '#fff4e6' }}>Credit the Culture</div>
            </div>
            <div style={{ display: 'flex', fontSize: 18, color: '#f0d5ba', fontWeight: 600 }}>Cultural Passport · {v.id}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', padding: '0 40px', flex: 1, justifyContent: 'center' }}>
            <div style={{ display: 'flex', fontSize: 48, fontWeight: 700, lineHeight: 1.15, color: '#ffffff' }}>{v.title.slice(0, 90)}</div>
            <div style={{ display: 'flex', fontSize: 23, marginTop: 18, color: '#fae3c6', lineHeight: 1.35 }}>Credit: {credit.slice(0, 160)}</div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 18 }}>
              <div style={{ display: 'flex', fontSize: 20, color: '#f3cfb0', fontWeight: 500 }}>{v.region}</div>
              <div style={{ display: 'flex', fontSize: 18, fontWeight: 700, marginLeft: 16, padding: '5px 18px', borderRadius: 999, background: '#f5c258', color: '#2a0805' }}>{lic}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 40px 34px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: 18, color: '#e8ceb5', maxWidth: 330, lineHeight: 1.35 }}>
              <div style={{ display: 'flex' }}>Scan to see what the creators and the licence say about reuse.</div>
            </div>
            <div style={{ display: 'flex', background: '#ffffff', padding: 8, borderRadius: 12, border: '3px solid #f5c258' }}>
              <img src={qr} width={138} height={138} alt="" />
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
