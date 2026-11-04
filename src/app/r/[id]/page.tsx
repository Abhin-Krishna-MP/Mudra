import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import { getRecordView, getTimeline } from '@/lib/repo';
import { publicKeys } from '@/lib/signing';
import { evaluate, USES, USE_IDS, VERDICT_LABEL, type Use } from '@/lib/permissions';
import { allFormats } from '@/lib/credit';
import { recordUrl } from '@/lib/site';
import { COMPILED_NOTE, LAYER_NOTE } from '@/lib/copy';
import { TwoLayers, PermissionChips } from '@/components/Permissions';
import { CopyButton } from '@/components/CopyButton';

export const dynamic = 'force-dynamic';
const GLYPH = { permitted: '✓', ask_first: '?', not_permitted: '✕' } as const;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const v = await getRecordView(await getDb(), (await params).id);
  return { title: v ? `${v.title} (${v.id})` : 'Record' };
}

export default async function Passport({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ use?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const db = await getDb();
  const v = await getRecordView(db, id);
  if (!v) notFound();
  const use = (USE_IDS.includes(sp.use as Use) ? sp.use : 'print_merch') as Use;
  const out = evaluate({ use, licence: v.licence, cultural: v.permissions, attributionRequired: v.attributionRequired, sensitivity: v.sensitivity });
  const credit = allFormats({ title: v.title, credits: v.credits, licence: v.licence, attributionRequired: v.attributionRequired, recordUrl: recordUrl(v.id), recordId: v.id });
  const timeline = await getTimeline(db, id, publicKeys());

  return (
    <article>
      <p className="ui muted" style={{ margin: 0 }}>Cultural Passport · {v.id}</p>
      <h1>{v.title}</h1>
      <ul className="chips">
        <li className="chip">{v.verificationLevel === 'verified' ? '✓ Verified by a reviewer against evidence' : 'Not yet verified'}</li>
        {v.disputed && <li className="chip ask">? Open report under review</li>}
        <li className="chip">{v.region}</li>{v.language && <li className="chip">{v.language}</li>}<li className="chip">{v.workType}</li>
        {v.sensitivity !== 'public' && <li className="chip ask">{v.sensitivity === 'restricted' ? 'Restricted' : 'Handle with care'}</li>}
      </ul>

      <div className="two">
        <div>
          <div className="mat" style={{ minHeight: 260 }}>
            {v.asset?.displayUrl ? <img src={v.asset.displayUrl} alt={v.asset.alt} /> : <p className="muted ui">The image for this record is withheld because it is marked restricted.</p>}
          </div>
          {v.asset && <p className="hint">{v.asset.sourceNote}</p>}
        </div>
        <div>
          <h2 style={{ marginTop: 0 }}>Credited</h2>
          <ul>{v.credits.map((c) => <li key={c.name + c.role}><strong>{c.name}</strong> — {c.role}{c.collective ? ' (collective)' : ''}</li>)}</ul>
          {v.custodian && <p className="ui"><strong>Stated custodian to contact:</strong> {v.custodian}</p>}
          <PermissionChips permissions={v.permissions} />
          <p className="hint">{LAYER_NOTE}</p>
          {v.submissionBasis === 'compiled_from_public_sources' && <p className="notice">{COMPILED_NOTE}</p>}
        </div>
      </div>

      <h2>Cultural context</h2>
      <p style={{ whiteSpace: 'pre-line' }}>{v.culturalContext}</p>
      {(v.contextSources.length > 0 || v.sourceUrl) && (
        <>
          <h3>Sources</h3>
          <ul className="ui">{v.contextSources.map((s) => <li key={s}>{/^https?:\/\//.test(s) ? <a href={s}>{s}</a> : s}</li>)}{v.sourceUrl && <li>Image/record page: <a href={v.sourceUrl}>{v.sourceUrl}</a></li>}</ul>
        </>
      )}

      <h2>Two layers of permission</h2>
      <TwoLayers permissions={v.permissions} licence={v.licence} />

      <section aria-labelledby="studio-h">
        <h2 id="studio-h">Reuse Studio</h2>
        <p className="muted">Pick what you want to do. The answer combines both layers and always takes the more careful one.</p>
        <nav aria-label="Choose a use"><ul className="uses">{USE_IDS.map((u) => <li key={u}><a href={`/r/${v.id}?use=${u}#studio-h`} aria-current={u === use ? 'true' : undefined}>{USES[u].label}</a></li>)}</ul></nav>
        <div className={`verdict ${out.verdict}`} role="status" style={{ marginTop: 16 }}>
          <strong><span aria-hidden="true">{GLYPH[out.verdict]} </span>{USES[use].label}: {VERDICT_LABEL[out.verdict]}</strong>
          <span>{out.guidance}</span>
        </div>
        <div className="two" style={{ marginTop: 12 }}>
          <div className="panel" style={{ margin: 0 }}><h3>Cultural layer</h3><p>{out.cultural.statement}</p></div>
          <div className="panel" style={{ margin: 0 }}><h3>File licence layer</h3><p>{out.licence.statement}</p></div>
        </div>
        {out.notes.map((n) => <p key={n} className="notice">{n}</p>)}
        <p><strong>Next step:</strong> {out.nextAction}</p>
        <p className="ui">{out.creditRequired ? 'Credit is required here. ' : 'Credit is not required by the licence, but is recommended. '}Copy a credit line:</p>
        {([['plain', 'Plain text', credit.plain], ['markdown', 'Markdown', credit.markdown], ['html', 'HTML snippet', credit.html], ['short', 'Short caption', credit.short]] as const).map(([k, label, text]) => (
          <div key={k}><h3 style={{ fontSize: '.95rem', marginTop: 12 }} className="ui">{label}</h3><pre className="credit">{text}</pre><CopyButton text={text} label={`Copy ${label.toLowerCase()}`} /></div>
        ))}
        <p style={{ marginTop: 16 }}>
          {v.asset?.displayUrl && <a className="btn" href={`/api/records/${v.id}/card.png`} download={`${v.id}-credit-card.png`}>Download credit card (PNG)</a>}{' '}
          <a className="btn secondary" href={`/r/${v.id}/report`}>Report a problem</a>{' '}
          <a className="btn secondary" href={`/verify/${v.id}`}>Verify this record</a>
        </p>
      </section>

      <h2>History</h2>
      <ol className="timeline">{timeline.map((t) => (
        <li key={t.seq} data-dot={t.hashOk ? '●' : '○'}><strong>{t.summary}</strong><br /><span className="muted"><time dateTime={t.at}>{new Date(t.at).toUTCString()}</time> · {t.role}{t.actor ? ` (${t.actor})` : ''} · integrity {t.hashOk ? 'ok' : 'broken'}</span></li>
      ))}</ol>
    </article>
  );
}
