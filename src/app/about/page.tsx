import type { ReactNode } from 'react';
import { DISCLAIMER, COMPILED_NOTE } from '@/lib/copy';
import { PageSheet } from '@/components/PageSheet';
import { Icon, type IconName } from '@/components/Icons';
import './about.css';

export const metadata = { title: 'About & limits' };

/** Two icons that are not in the shared set; same 24px / 1.7 stroke style as Icons.tsx. */
function Glyph({ children }: { children: ReactNode }) {
  return (
    <svg className="icon" width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}
const Cycle = () => (
  <Glyph>
    <path d="M20 11a8 8 0 0 0-14.4-4.2M4 13a8 8 0 0 0 14.4 4.2" />
    <path d="M5.6 3.5v3.6h3.6M18.4 20.5v-3.6h-3.6" />
  </Glyph>
);
const Sprout = () => (
  <Glyph>
    <path d="M12 21v-9" />
    <path d="M12 12c0-3.6-2.6-5.8-6.5-5.8 0 3.6 2.6 5.8 6.5 5.8Z" />
    <path d="M12 14.5c0-3 2.2-5 5.8-5 0 3-2.2 5-5.8 5Z" />
  </Glyph>
);

const CARDS: { icon: IconName; title: string; text: string }[] = [
  { icon: 'target', title: 'Our Purpose', text: 'Make cultural knowledge accessible.' },
  { icon: 'shield', title: 'Our Approach', text: 'Credit + Reuse with care.' },
  { icon: 'info', title: 'Our Limits', text: 'Not a copyright detector.' },
];

const DOES: { icon: ReactNode; title: string; text: string }[] = [
  { icon: <Icon name="book" size={26} />, title: 'Document', text: 'Kerala’s cultural works and knowledge.' },
  { icon: <Icon name="users" size={26} />, title: 'Credit', text: 'Acknowledge creators and communities.' },
  { icon: <Cycle />, title: 'Guide Reuse', text: 'Show how works can be used with proper credit.' },
  { icon: <Sprout />, title: 'Enable Access', text: 'Create a trusted, open cultural resource.' },
];

export default function About() {
  return (
    <div className="wrap page about-page">
      <PageSheet eyebrow="About —" title="About Mudra" lede="A community-centred platform to explore, credit and responsibly reuse Kerala’s cultural expressions.">
        {/* 1. Purpose / Approach / Limits */}
        <div className="ab-cards">
          {CARDS.map((c) => (
            <div key={c.title} className="ab-card">
              <span className="ab-ico"><Icon name={c.icon} size={26} /></span>
              <span className="ab-sep" aria-hidden="true" />
              <div className="ab-card-text">
                <h2>{c.title}</h2>
                <p>{c.text}</p>
              </div>
              <Icon name="lotus" size={92} className="ab-lotus" />
            </div>
          ))}
        </div>

        {/* 2. Limits panel */}
        <section className="ab-limits" aria-labelledby="ab-limits-h">
          <div className="ab-limits-art">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/mudra/about-scene.webp" alt="" width={900} height={438} decoding="async" /></div>
          <span className="ab-sep" aria-hidden="true" />
          <div className="ab-limits-text">
            <h2 id="ab-limits-h">About Mudra and its limits</h2>
            <p>{DISCLAIMER}</p>
          </div>
        </section>

        {/* 3. What Mudra does */}
        <section className="ab-does" aria-labelledby="ab-does-h">
          <h2 id="ab-does-h" className="ab-title">What Mudra Does</h2>
          <ul className="ab-does-grid">
            {DOES.map((d) => (
              <li key={d.title}>
                <span className="ab-ico ab-ico-sm">{d.icon}</span>
                <div>
                  <h3>{d.title}</h3>
                  <p>{d.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 4. Full details (collapsed so the first view matches the design) */}
        <details className="ab-more">
          <summary><span>Read the full details</span><Icon name="chevDown" size={18} /></summary>
        <div className="ab-details">

                    <p className="ab-passport">
            Each work has a <strong>Cultural Passport</strong>: who it comes from, where the information comes from, and what the creators or community and the file licence say about sharing, commercial use, adaptation and AI training. These are two separate layers. The Reuse Studio combines them and always takes the more careful answer. Where nobody has said, the passport says so: <em>Not stated by the creator or community</em>.
          </p>
          <section className="ab-block">
            <h2 className="ab-title">Where the records come from</h2>
            <p>Records are written by people from cited sources. Records compiled from public sources are marked: “{COMPILED_NOTE}” Images are used only with a recorded licence. We never alter sacred imagery.</p>
          </section>

          <section className="ab-block">
            <h2 className="ab-title">What the checks show, and do not show</h2>
            <div className="table-wrap ab-table">
              <table>
                <thead><tr><th>Mechanism</th><th>Shows</th><th>Does not show</th></tr></thead>
                <tbody>
                  <tr><td data-label="Mechanism">Hash-linked history</td><td data-label="Shows">The record’s history was not changed or removed after the fact, on this server.</td><td data-label="Does not show">That the claims are true. It is tamper-evident, not tamper-proof.</td></tr>
                  <tr><td data-label="Mechanism">Signatures (when switched on)</td><td data-label="Shows">Events were written by the holder of the service’s signing key.</td><td data-label="Does not show">Who the person behind a claim is.</td></tr>
                  <tr><td data-label="Mechanism">File hash (in your browser)</td><td data-label="Shows">Whether your file is byte-for-byte the registered image.</td><td data-label="Does not show">Anything about a resized or edited copy.</td></tr>
                  <tr><td data-label="Mechanism">Check an image</td><td data-label="Shows">A visual similarity score against registered images (dHash distance ≤ 6 strong, ≤ 12 possible), as a pointer for human review. Measured on real seed photos: survives recompression and resizing; distinct subjects score ≥ 28.</td><td data-label="Does not show">Heavy crops, mirroring and substantial alterations can be missed; visual match is a pointer for human review, not verification.</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <div className="ab-two">
            <section className="ab-block">
              <h2 className="ab-title">Honest limits</h2>
              <ul className="ab-list">
                <li>The licence table has been checked against Creative Commons legal codes; unaddressed uses (such as AI training under CC 4.0) conservatively map to “ask first”.</li>
                <li>Rate limiting is best-effort (a hidden field and a small in-memory limit).</li>
                <li>A small catalogue cannot cover a living culture; absence of a record means nothing.</li>
                <li>Permissions are what has been stated to us. They are a snapshot, not legal advice.</li>
              </ul>
            </section>
            <section className="ab-block">
              <h2 className="ab-title">How this was built</h2>
              <p>AI coding tools were used to write code. No cultural facts, sources, permissions or licences were written by AI; those were written and checked by the team from cited sources.</p>
            </section>
          </div>
        </div>
        </details>
      </PageSheet>
    </div>
  );
}
