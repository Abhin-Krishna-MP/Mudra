export interface Searchable {
  id: string;
  title: string;
  region: string;
  workType: string;
  parties: string[];
}

/** Spelling variants and transliterations. Both sides are normalised before comparing. */
export const ALIASES: Record<string, string> = {
  teyyam: 'theyyam', theyam: 'theyyam', theyyem: 'theyyam',
  kathakkali: 'kathakali', kadhakali: 'kathakali',
  kasavu: 'kasavu', kasavoo: 'kasavu', kasavuu: 'kasavu',
  kannadi: 'kannadi', kanadi: 'kannadi',
  nettipattam: 'nettipattam', netti: 'nettipattam',
  kalamezhuthu: 'kalamezhuthu', kalamezhuthum: 'kalamezhuthu', kalam: 'kalamezhuthu',
  kaikottikali: 'kaikottikali', thiruvathira: 'kaikottikali',
};

export const normalise = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\- ]+/g, ' ').replace(/\s+/g, ' ').trim();

const tokens = (s: string) =>
  normalise(s).split(' ').filter(Boolean).map((t) => ALIASES[t] ?? t);

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

function tokenScore(q: string, t: string): number {
  if (q === t) return 10;
  if (t.startsWith(q) && q.length >= 3) return 7;
  if (q.length >= 4) {
    const d = levenshtein(q, t);
    const allowed = q.length >= 7 ? 2 : 1;
    if (d <= allowed) return 6 - d;
  }
  return 0;
}

export interface Filters { region?: string; workType?: string }

export function searchRecords<T extends Searchable>(items: T[], query: string, filters: Filters = {}): T[] {
  const pool = items.filter(
    (r) => (!filters.region || r.region === filters.region) && (!filters.workType || r.workType === filters.workType),
  );
  const q = query.trim();
  if (!q) return pool;
  const qNorm = normalise(q);
  const scored = pool.map((r) => {
    if (r.id.toLowerCase() === q.toLowerCase()) return { r, s: 1000 };
    let s = 0;
    if (r.id.toLowerCase().includes(q.toLowerCase())) s += 200;
    const qt = tokens(qNorm);
    const titleT = tokens(r.title);
    const partyT = r.parties.flatMap(tokens);
    const regionT = tokens(r.region);
    let matched = 0;
    for (const t of qt) {
      const ts = Math.max(0, ...titleT.map((x) => tokenScore(t, x)));
      const ps = Math.max(0, ...partyT.map((x) => tokenScore(t, x))) * 0.6;
      const rs = Math.max(0, ...regionT.map((x) => tokenScore(t, x))) * 0.4;
      const best = Math.max(ts * 1.5, ps, rs);
      if (best > 0) { matched++; s += best; }
    }
    if (matched < qt.length) return { r, s: 0 };
    return { r, s };
  });
  return scored.filter((x) => x.s > 0).sort((a, b) => b.s - a.s).map((x) => x.r);
}
