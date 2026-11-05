import { getDb } from '@/lib/db';
import { listRecords } from '@/lib/repo';
import { Icon, type IconName } from '@/components/Icons';
import { LotusMark } from '@/components/Ornaments';
import { Carousel } from '@/components/Carousel';
import { RecordTile } from '@/components/RecordTile';
import { Petals } from '@/components/Petals';
import { Lotus3D } from '@/components/Lotus3D';

export const dynamic = 'force-dynamic';

const QUICK: { href: string; label: string; icon: IconName }[] = [
  { href: '/catalogue', label: 'Cultural Passport', icon: 'book' },
  { href: '/reuse', label: 'Reuse Studio', icon: 'layers' },
  { href: '/verify', label: 'Verify Record', icon: 'shield' },
  { href: '/check', label: 'Check an Image', icon: 'scan' },
  { href: '/submit', label: 'Submit a Record', icon: 'upload' },
];

/** Names are the six forms already named in ASSETS_NEEDED.md. No new cultural claims. */
const FORMS = ['Theyyam', 'Kathakali', 'Kerala murals', 'Handicrafts', 'Folk arts', 'Kalaripayattu'];
const TICKER_ITEMS = [...FORMS, ...FORMS];

const PILLARS: { word: string; text: string; cta: string; href: string; icon: IconName }[] = [
  { word: 'Discover', text: 'Explore Kerala’s art, craft and cultural expressions.', cta: 'Explore Catalogue', href: '/catalogue', icon: 'book' },
  { word: 'Credit', text: 'See who each work comes from, and credit them.', cta: 'Verify a record', href: '/verify', icon: 'shield' },
  { word: 'Reuse', text: 'Know how you may reuse it, with the creators’ terms.', cta: 'Open Reuse Studio', href: '/reuse', icon: 'layers' },
];

export default async function Home() {
  const all = await listRecords(await getDb());
  const shown = all.slice(0, 10);
  return (
    <>
      <section className="hero" aria-labelledby="hero-h" suppressHydrationWarning>
        <div className="hero-stage" aria-hidden="true" suppressHydrationWarning>
          <div className="stage-3d" suppressHydrationWarning>
            <img className="layer l-bg lt" src="/mudra/hero-bg.webp" alt="" fetchPriority="high" decoding="async" />
            <div className="mist" />
            <img className="layer l-fig lt" src="/mudra/hero-figure.webp" alt="" decoding="async" />
            <div className="cloth-sheen lt" />
            <div className="layer d-plate d-bg dk" />
            <img className="layer d-fig dk" src="/mudra/hero-dark-figure.webp" alt="" decoding="async" />
            {/* Light: silk glows under the pointer. Dark: the oil-lamp flares when the pointer comes near (positions set in Motion.tsx) */}
            <div className="cloth-glow lt" />
            <div className="lamp-rig dk">
              <i className="lamp-bloom" />
              <i className="lamp-spill" />
              <i className="lamp-spot" />
              <i className="lamp-flame" />
            </div>
          </div>
        </div>
        <div className="hero-bg" aria-hidden="true" />
        <Petals />
        <div className="wrap hero-inner">
          <span className="ghost-ml" lang="ml" aria-hidden="true">മുദ്ര</span>
          <div className="hero-copy">
            <p className="eyebrow">Kerala’s Living Heritage</p>
            <h1 id="hero-h"><span className="w" style={{ '--i': 0 } as React.CSSProperties}>Discover</span><span className="dot" aria-hidden="true"> · </span><span className="sr">, </span><span className="w" style={{ '--i': 1 } as React.CSSProperties}>Credit</span><span className="dot" aria-hidden="true"> · </span><span className="sr">, </span><span className="w" style={{ '--i': 2 } as React.CSSProperties}>Reuse</span> <em className="w" style={{ '--i': 3 } as React.CSSProperties}>Responsibly</em></h1>
            <p className="lede">A digital space to explore Kerala’s art, craft and cultural expressions, see who they come from, and know how you may reuse them with the creators’ terms.</p>
            <div className="cta">
              <a className="btn gold" data-magnetic href="/catalogue">Explore Catalogue <Icon name="arrow" size={18} /></a>
              <a className="btn ghost" data-magnetic href="/reuse"><Icon name="layers" size={18} /> Reuse Studio</a>
            </div>
          </div>
        </div>
      </section>

      <div className="wrap">
        <nav className="quick" aria-label="What would you like to do?">
          <ul>
            {QUICK.map((q) => (
              <li key={q.href} data-reveal suppressHydrationWarning style={{ '--i': QUICK.indexOf(q) } as React.CSSProperties}><a href={q.href} data-tilt="14"><span className="q-ico"><Icon name={q.icon} size={30} /></span><span>{q.label}</span></a></li>
            ))}
          </ul>
        </nav>

        <div className="ticker" aria-label="Art forms in the catalogue" role="group">
          <div className="ticker-track">
            <ul>{TICKER_ITEMS.map((f, i) => <li key={`${f}-${i}`}>{f}</li>)}</ul>
            <ul aria-hidden="true">{TICKER_ITEMS.map((f, i) => <li key={`dup-${f}-${i}`}>{f}</li>)}</ul>
          </div>
        </div>

        <section className="explore" aria-labelledby="explore-h" data-reveal>
          <div className="explore-head">
            <h2 id="explore-h"><LotusMark size={30} />Explore Kerala’s Cultural Expressions{all.length > 0 && <span className="count">{all.length} {all.length === 1 ? 'record' : 'records'}</span>}</h2>
            <a className="view-all" href="/catalogue">View All <Icon name="arrow" size={18} /></a>
          </div>
          {shown.length === 0 ? (
            <p className="muted">No records are published yet. <a href="/submit">Submit a work</a>.</p>
          ) : (
            <Carousel label="Cultural expressions">{shown.map((r, i) => <RecordTile key={r.id} r={r} i={i} compact />)}</Carousel>
          )}
        </section>

        <section className="pillars" aria-labelledby="pill-h" data-reveal>
          <Lotus3D />
          <div className="pillars-body">
            <p className="eyebrow-line">Credit the Culture</p>
            <h2 id="pill-h">Three simple steps, every time</h2>
            <ul className="flipgrid">
              {PILLARS.map((p, i) => (
                <li key={p.word} style={{ '--i': i } as React.CSSProperties}>
                  <a className="flip" href={p.href}>
                    <span className="flip-in">
                      <span className="face front" aria-hidden="true"><span className="q-ico"><Icon name={p.icon} size={30} /></span><span className="flip-word">{p.word}</span></span>
                      <span className="face back"><strong className="flip-word">{p.word}</strong><span>{p.text}</span><span className="flip-go">{p.cta} <Icon name="arrow" size={16} /></span></span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}
