import { notFound } from 'next/navigation';
import QRCode from 'qrcode';
import { getDb } from '@/lib/db';
import { getRecordView, getTimeline } from '@/lib/repo';
import { publicKeys } from '@/lib/signing';
import { USE_IDS, LICENCES, type Use } from '@/lib/permissions';
import { allFormats } from '@/lib/credit';
import { recordUrl } from '@/lib/site';
import { COMPILED_NOTE, LAYER_NOTE } from '@/lib/copy';
import { typeSingular } from '@/lib/ui';
import { TwoLayers } from '@/components/Permissions';
import { CopyButton } from '@/components/CopyButton';
import { Gallery, type GalleryItem } from '@/components/Gallery';
import { ShareButton } from '@/components/ShareButton';
import { BookmarkButton } from '@/components/BookmarkButton';
import './passport.css';
import { Tabs } from '@/components/Tabs';
import { Icon } from '@/components/Icons';
import { Seal } from '@/components/Seal';
import { getStewardsForRecord } from '@/lib/repo-grants';
import { RequestStatusTab } from '@/components/RequestStatusTab';
import { InteractiveReuseGlance } from '@/components/InteractiveReuseGlance';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const v = await getRecordView(await getDb(), (await params).id);
  return { title: v ? `${v.title} (${v.id})` : 'Record' };
}

export default async function Passport({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ use?: string; ask?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const db = await getDb();
  const v = await getRecordView(db, id);
  if (!v) notFound();
  const stewards = await getStewardsForRecord(db, id);
  const hasSteward = stewards.length > 0;
  const use = (USE_IDS.includes(sp.use as Use) ? sp.use : 'print_merch') as Use;
  const credit = allFormats({ title: v.title, credits: v.credits, licence: v.licence, attributionRequired: v.attributionRequired, recordUrl: recordUrl(v.id), recordId: v.id });
  const timeline = await getTimeline(db, id, publicKeys());
  const qr = await QRCode.toDataURL(recordUrl(v.id), { margin: 1, width: 240, errorCorrectionLevel: 'M' });
  const lic = LICENCES[v.licence];
  const community = v.credits.find((c) => c.collective)?.name ?? v.credits[0]?.name ?? 'Not yet credited';

  const firstPara = (v.culturalContext || '').split(/\n+/)[0].trim();
  const blurb = firstPara.length > 230 ? firstPara.slice(0, 227).replace(/\s+\S*$/, '') + '…' : firstPara;
  const extra = ((v as unknown as { media?: { displayUrl?: string; alt?: string }[] }).media ?? []).filter((m) => m.displayUrl);
  const gallery: GalleryItem[] = [
    ...(v.asset?.displayUrl ? [{ url: v.asset.displayUrl, alt: v.asset.alt }] : []),
    ...extra.map((m) => ({ url: m.displayUrl as string, alt: m.alt ?? v.title })),
  ];
  const period = (v as unknown as { period?: string }).period;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': recordUrl(v.id),
    name: v.title,
    description: v.culturalContext.slice(0, 300),
    creator: v.credits.map((c) => ({
      '@type': c.collective ? 'Organization' : 'Person',
      name: c.name,
      jobTitle: c.role,
    })),
    creditText: credit.plain,
    license: lic.url || undefined,
    acquireLicensePage: `${recordUrl(v.id)}#studio-h`,
    usageInfo: `${recordUrl(v.id)}#studio-h`,
    image: v.asset?.displayUrl ? `${process.env.NEXT_PUBLIC_BASE_URL || ''}${v.asset.displayUrl}` : undefined,
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'file' as const, content: (
      <div className="pp-overview">
        <section className="pp-card-in pp-about" aria-labelledby="about-h">
          <h2 id="about-h">About the Work</h2>
          <p style={{ whiteSpace: 'pre-line' }}>{v.culturalContext}</p>
          {v.submissionBasis === 'compiled_from_public_sources' && <p className="notice">{COMPILED_NOTE}</p>}
        </section>
        <section className="pp-card-in pp-glance-card" aria-labelledby="glance-h">
          <h2 id="glance-h">At a Glance <Icon name="info" size={16} className="pp-i" /></h2>
          <dl>
            {period && <div><dt><Icon name="calendar" size={18} />Period</dt><dd>{period}</dd></div>}
            <div><dt><Icon name="users" size={18} />Type</dt><dd>{typeSingular(v.workType)}</dd></div>
            {v.language && <div><dt><Icon name="book" size={18} />Language</dt><dd>{v.language}</dd></div>}
            <div><dt><Icon name="pin" size={18} />Region</dt><dd>{v.region}</dd></div>
          </dl>
        </section>
      </div>
    ) },
    { id: 'media', label: `Media (${gallery.length})`, icon: 'image' as const, content: (
      gallery.length > 0 ? (
        <ul className="pp-media">{gallery.map((g, n) => <li key={g.url + n}><a href={g.url} target="_blank" rel="noopener noreferrer"><img src={g.url} alt={g.alt} loading="lazy" /></a></li>)}</ul>
      ) : <p className="muted">No media has been added to this record.</p>
    ) },
    { id: 'creators', label: 'Creators', icon: 'users' as const, content: (
      <>
        <ul>{v.credits.map((c) => <li key={c.name + c.role}><strong>{c.name}</strong> — {c.role}{c.collective ? ' (collective)' : ''}</li>)}</ul>
        {v.credits.length === 0 && <p className="muted">Creators are not yet credited.</p>}
        {v.custodian && <p><strong>Stated custodian to contact:</strong> {v.custodian}</p>}
      </>
    ) },
    { id: 'permissions', label: 'Permissions', icon: 'shield' as const, content: (
      <>
        <p className="hint" style={{ marginBottom: 12 }}>{LAYER_NOTE}</p>
        <TwoLayers permissions={v.permissions} licence={v.licence} />
      </>
    ) },
    { id: 'sources', label: 'Sources', icon: 'link' as const, content: (
      (v.contextSources.length > 0 || v.sourceUrl || v.asset?.sourceNote) ? (
        <ul>
          {v.contextSources.map((s) => <li key={s}>{/^https?:\/\//.test(s) ? <a href={s}>{s}</a> : s}</li>)}
          {v.sourceUrl && <li>Image/record page: <a href={v.sourceUrl}>{v.sourceUrl}</a></li>}
          {v.asset?.sourceNote && <li>Image credit: {v.asset.sourceNote}</li>}
        </ul>
      ) : <p className="muted">No sources are listed for this record.</p>
    ) },
    { id: 'history', label: 'History', icon: 'clock' as const, content: (
      <ol className="timeline">{timeline.map((t) => (
        <li key={t.seq} data-dot={t.hashOk ? '●' : '○'}><strong>{t.summary}</strong><br /><span className="muted"><time dateTime={t.at}>{new Date(t.at).toUTCString()}</time> · {t.role}{t.actor ? ` (${t.actor})` : ''} · integrity {t.hashOk ? 'ok' : 'broken'}</span></li>
      ))}</ol>
    ) },
    { id: 'request-status', label: 'Request Status', icon: 'clock' as const, content: (
      <RequestStatusTab recordId={v.id} recordTitle={v.title} hasSteward={hasSteward} />
    ) },
  ];

  return (
    <div className="wrap page passport-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="pp">
        <header className="pp-hero has-depth">
          <div className="hero-stage depth-stage" aria-hidden="true" suppressHydrationWarning>
            <div className="stage-3d" suppressHydrationWarning>
              <div className="layer l-bg lt" />
              <div className="mist" />
              <div className="layer l-fig lt" />
              <div className="layer d-bg dk" />
              <div className="layer d-fig dk" />
            </div>
          </div>
          <a className="pp-back" href="/catalogue"><Icon name="arrow" size={16} className="flip" /> Back to Catalogue</a>
          <div className="pp-top">
            <div className="pp-media-col">
              <p className="pp-id">{v.id}</p>
              <div className="passport-art pp-art" data-tilt="0">
                <Gallery items={gallery} withheld={v.sensitivity === 'restricted'} />
                {v.verificationLevel === 'verified' && <Seal id={v.id} credits={v.credits} label={`Verified identity seal for ${v.id}`} />}
              </div>
            </div>
            <div className="pp-info">
              <div className="pp-title-row">
                <div className="pp-title-block">
                  <p className="pp-id pp-id-m">{v.id}</p>
                  <h1 className="pp-title">{v.title}</h1>
                  <ul className="chips pp-status">
                    {v.verificationLevel === 'verified' ? <li className="chip verified"><span aria-hidden="true">✓ </span>Verified by a reviewer against evidence</li> : <li className="chip"><Icon name="shield" size={14} /> Not yet verified</li>}
                    {v.disputed && <li className="chip ask"><span aria-hidden="true">? </span>Open report under review</li>}
                    {v.sensitivity !== 'public' && <li className="chip ask">{v.sensitivity === 'restricted' ? 'Restricted' : 'Handle with care'}</li>}
                  </ul>
                  {blurb && <p className="pp-blurb">{blurb}</p>}
                </div>
                <div className="qr pp-qr">
                  <img src={qr} alt={`QR code linking to the passport for ${v.id}`} width={92} height={92} />
                  <span>Scan to open this record</span>
                </div>
              </div>
              <div className="pp-meta">
                <ul className="meta-list">
                  <li><Icon name="users" size={18} /><b>Community</b><span>{community}</span></li>
                  <li><Icon name="tag" size={18} /><b>Category</b><span>{typeSingular(v.workType)}</span></li>
                </ul>
                <ul className="meta-list">
                  <li><Icon name="pin" size={18} /><b>Region</b><span>{v.region}{v.language ? ` · ${v.language}` : ''}</span></li>
                  <li><Icon name="scale" size={18} /><b>Licence</b><span>{lic.url ? <a href={lic.url}>{lic.label}</a> : lic.label}</span></li>
                  <li><Icon name="file" size={18} /><b>Record</b><span>{v.id}</span></li>
                </ul>
              </div>
            </div>
          </div>

          <InteractiveReuseGlance
            recordId={v.id}
            recordTitle={v.title}
            licence={v.licence}
            permissions={v.permissions}
            attributionRequired={v.attributionRequired}
            sensitivity={v.sensitivity}
            credit={credit}
            hasSteward={hasSteward}
            initialUse={use}
            initialOpen={sp.ask === '1'}
          />

          <div className="pp-actions-bar">
            <div className="pp-actions-main">
              <a className="btn pp-primary" href="#studio-h">
                <Icon name="refresh" size={18} /> Check Reuse Permissions
              </a>
              <CopyButton text={credit.plain} label="Copy Credit Line" icon="quote" />
              <ShareButton title={v.title} />
              {v.asset?.displayUrl && <a className="btn secondary" href={`/api/records/${v.id}/card.png`} download={`${v.id}-credit-card.png`}><Icon name="download" size={16} /> Download Credit Card</a>}
              <a className="btn secondary" href={`/verify/${v.id}`}><Icon name="shield" size={16} /> Verify this record</a>
            </div>
            <div className="pp-save-wrap">
              <BookmarkButton id={v.id} title={v.title} />
            </div>
          </div>
        </header>

        <div className="pp-body">
          <Tabs label={`${v.title} passport sections`} tabs={tabs} />
        </div>
      </article>
    </div>
  );
}
