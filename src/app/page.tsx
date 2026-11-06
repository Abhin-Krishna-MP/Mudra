import { getDb } from '@/lib/db';
import { listRecords } from '@/lib/repo';
import { Icon, type IconName } from '@/components/Icons';
import { LotusMark } from '@/components/Ornaments';
import { Carousel } from '@/components/Carousel';
import { RecordTile } from '@/components/RecordTile';
import { Lotus3D } from '@/components/Lotus3D';
import { TopSectionDark } from '@/components/TopSectionDark';

export const dynamic = 'force-dynamic';

const QUICK: { href: string; label: string; icon: IconName }[] = [
  { href: '/catalogue', label: 'Cultural Passport', icon: 'book' },
  { href: '/reuse', label: 'Reuse Studio', icon: 'layers' },
  { href: '/verify', label: 'Verify a Record', icon: 'shield' },
  { href: '/check', label: 'Check an Image', icon: 'scan' },
  { href: '/submit', label: 'Submit a Record', icon: 'upload' },
];

/** Names are the six forms already named in ASSETS_NEEDED.md. No new cultural claims. */
const FORMS = ['Theyyam', 'Kathakali', 'Kerala murals', 'Handicrafts', 'Folk arts', 'Kalaripayattu'];
const TICKER_ITEMS = [...FORMS, ...FORMS];

const PILLARS: { word: string; short: string; text: string; cta: string; href: string; icon: IconName }[] = [
  { word: 'Discover', short: 'Explore verified cultural records', text: 'Explore Kerala’s art, craft and cultural expressions.', cta: 'Explore Catalogue', href: '/catalogue', icon: 'book' },
  { word: 'Credit', short: 'Give proper attribution', text: 'See who each work comes from, and credit them.', cta: 'Verify a record', href: '/verify', icon: 'shield' },
  { word: 'Reuse', short: 'Check permissions and reuse responsibly', text: 'Know how you may reuse it, with the creators’ terms.', cta: 'Open Reuse Studio', href: '/reuse', icon: 'layers' },
];

export default async function Home() {
  const all = await listRecords(await getDb());
  const shown = all.slice(0, 10);

  return (
    <>
      {/* Redesigned Dark Top Section: Full-screen Stage Curtain & Layered 3D Theyyam Hero */}
      <TopSectionDark scrollCueHref="#quick-links" />

      {/* Preserved Lower Sections: Quick Actions, Marquee Ticker, Record Explorer, and 3D Pillars */}
      <div className="wrap" id="quick-links">
        <nav className="quick" aria-label="What would you like to do?">
          <ul>
            {QUICK.map((q) => (
              <li key={q.href} data-reveal suppressHydrationWarning style={{ '--i': QUICK.indexOf(q) } as React.CSSProperties}>
                <a href={q.href} data-tilt="14">
                  <span className="q-ico"><Icon name={q.icon} size={30} /></span>
                  <span>{q.label}</span>
                </a>
              </li>
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
            <h2 id="explore-h">
              <LotusMark size={30} />
              <span className="eh-title">Explore Kerala’s <em>Cultural Expressions</em></span>
              {all.length > 0 && <span className="count"><Icon name="layers" size={18} className="count-ico" />{all.length} {all.length === 1 ? 'record' : 'records'}</span>}
            </h2>
            <a className="view-all" href="/catalogue">View All <Icon name="arrow" size={18} /></a>
          </div>
          <div className="explore-rule" aria-hidden="true"><i /></div>
          {shown.length === 0 ? (
            <p className="muted">No records are published yet. <a href="/submit">Submit a work</a>.</p>
          ) : (
            <Carousel label="Cultural expressions">
              {shown.map((r, i) => <RecordTile key={r.id} r={r} i={i} compact />)}
            </Carousel>
          )}
          {shown.length > 0 && <a className="view-all view-all-foot" href="/catalogue">View all {all.length} records <Icon name="arrow" size={16} /></a>}
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
                      <span className="face front" aria-hidden="true">
                        <span className="q-ico"><Icon name={p.icon} size={30} /></span>
                        <span className="flip-word">{p.word}</span>
                        <span className="pill-desc">{p.short}</span>
                      </span>
                      <span className="face back">
                        <strong className="flip-word">{p.word}</strong>
                        <span>{p.text}</span>
                        <span className="flip-go">{p.cta} <Icon name="arrow" size={16} /></span>
                      </span>
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
