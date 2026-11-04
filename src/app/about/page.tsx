import { DISCLAIMER, NOT_FINANCIAL, COMPILED_NOTE } from '@/lib/copy';
export const metadata = { title: 'About & limits' };
export default function About() {
  return (
    <>
      <h1>About Mudra and its limits</h1>
      <p>{DISCLAIMER}</p>
      <p>{NOT_FINANCIAL}</p>
      <h2>What Mudra does</h2>
      <p>Each work has a <strong>Cultural Passport</strong>: who it comes from, where the information comes from, and what the creators or community and the file licence say about sharing, commercial use, adaptation and AI training. These are two separate layers. The Reuse Studio combines them and always takes the more careful answer. Where nobody has said, the passport says so: <em>Not stated by the creator or community</em>.</p>
      <h2>Where the records come from</h2>
      <p>Records are written by people from cited sources. Records compiled from public sources are marked: “{COMPILED_NOTE}” Images are used only with a recorded licence. We never alter sacred imagery.</p>
      <h2>What the checks show, and do not show</h2>
      <table><thead><tr><th>Mechanism</th><th>Shows</th><th>Does not show</th></tr></thead><tbody>
        <tr><td>Hash-linked history</td><td>The record’s history was not changed or removed after the fact, on this server.</td><td>That the claims are true. It is tamper-evident, not tamper-proof.</td></tr>
        <tr><td>Signatures (when switched on)</td><td>Events were written by the holder of the service’s signing key.</td><td>Who the person behind a claim is.</td></tr>
        <tr><td>File hash (in your browser)</td><td>Whether your file is byte-for-byte the registered image.</td><td>Anything about a resized or edited copy.</td></tr>
        <tr><td>Check an image</td><td>A visual similarity score against registered images, as a pointer for human review.</td><td>Heavy crops, mirroring and edits can be missed; false pointers are possible. Thresholds still need measuring on real fixtures.</td></tr>
      </tbody></table>
      <h2>Honest limits</h2>
      <ul>
        <li>The licence table is a first reading and must be checked against the full licence texts; where unsure it says “ask first”.</li>
        <li>Rate limiting is best-effort (a hidden field and a small in-memory limit).</li>
        <li>A small catalogue cannot cover a living culture; absence of a record means nothing.</li>
        <li>Permissions are what has been stated to us. They are a snapshot, not legal advice.</li>
      </ul>
      <h2>How this was built</h2>
      <p>AI coding tools were used to write code. No cultural facts, sources, permissions or licences were written by AI; those were written and checked by the team from cited sources.</p>
    </>
  );
}
