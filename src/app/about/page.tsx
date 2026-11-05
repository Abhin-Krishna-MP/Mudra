import { DISCLAIMER, NOT_FINANCIAL, COMPILED_NOTE } from '@/lib/copy';
import { PageSheet } from '@/components/PageSheet';
import { Icon, type IconName } from '@/components/Icons';
export const metadata = { title: 'About & limits' };

const CARDS: { icon: IconName; title: string; text: string }[] = [
  { icon: 'target', title: 'Our Purpose', text: 'Make cultural knowledge accessible' },
  { icon: 'shield', title: 'Our Approach', text: 'Credit + Reuse with care' },
  { icon: 'info', title: 'Our Limits', text: 'Not a copyright detector' },
];

export default function About() {
  return (
    <div className="wrap page">
      <PageSheet title="About Mudra" lede="A community-centred platform to explore, credit and responsibly reuse Kerala’s cultural expressions.">
        <div className="about-cards">
          {CARDS.map((c) => (
            <div key={c.title} className="about-card"><span className="q-ico"><Icon name={c.icon} size={28} /></span><h2 style={{ margin: 0, fontSize: '1.1rem' }}>{c.title}</h2><p>{c.text}</p></div>
          ))}
        </div>
        <div className="prose">
          <h2>About Mudra and its limits</h2>
          <p>{DISCLAIMER}</p>
          <p>{NOT_FINANCIAL}</p>
          <h2>What Mudra does</h2>
          <p>Each work has a <strong>Cultural Passport</strong>: who it comes from, where the information comes from, and what the creators or community and the file licence say about sharing, commercial use, adaptation and AI training. These are two separate layers. The Reuse Studio combines them and always takes the more careful answer. Where nobody has said, the passport says so: <em>Not stated by the creator or community</em>.</p>
          <h2>Where the records come from</h2>
          <p>Records are written by people from cited sources. Records compiled from public sources are marked: “{COMPILED_NOTE}” Images are used only with a recorded licence. We never alter sacred imagery.</p>
          <h2>What the checks show, and do not show</h2>
          <div className="table-wrap"><table><thead><tr><th>Mechanism</th><th>Shows</th><th>Does not show</th></tr></thead><tbody>
            <tr><td>Hash-linked history</td><td>The record’s history was not changed or removed after the fact, on this server.</td><td>That the claims are true. It is tamper-evident, not tamper-proof.</td></tr>
            <tr><td>Signatures (when switched on)</td><td>Events were written by the holder of the service’s signing key.</td><td>Who the person behind a claim is.</td></tr>
            <tr><td>File hash (in your browser)</td><td>Whether your file is byte-for-byte the registered image.</td><td>Anything about a resized or edited copy.</td></tr>
            <tr><td>Check an image</td><td>A visual similarity score against registered images (dHash distance ≤ 6 strong, ≤ 12 possible), as a pointer for human review. Measured on real seed photos: survives recompression and resizing; distinct subjects score ≥ 28.</td><td>Heavy crops, mirroring and substantial alterations can be missed; visual match is a pointer for human review, not verification.</td></tr>
          </tbody></table></div>
          <h2>Honest limits</h2>
          <ul>
            <li>The licence table has been checked against Creative Commons legal codes; unaddressed uses (such as AI training under CC 4.0) conservatively map to “ask first”.</li>
            <li>Rate limiting is best-effort (a hidden field and a small in-memory limit).</li>
            <li>A small catalogue cannot cover a living culture; absence of a record means nothing.</li>
            <li>Permissions are what has been stated to us. They are a snapshot, not legal advice.</li>
          </ul>
          <h2>How this was built</h2>
          <p>AI coding tools were used to write code. No cultural facts, sources, permissions or licences were written by AI; those were written and checked by the team from cited sources.</p>
        </div>
      </PageSheet>
    </div>
  );
}
