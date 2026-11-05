import { randomUUID } from 'node:crypto';
import type { Db, Stmt, Row } from './db/types';
import { GENESIS, newEvent, verifyChain, type AuditRow, type VerifyResult } from './chain';
import { requireRole } from './auth';
import { LICENCE_IDS, CAPABILITIES, type Capability, type CulturalState, type LicenceId, type Sensitivity } from './permissions';
import type {
  Actor, ActionResult, Basis, RecordSummary, RecordView, Status, TimelineItem,
} from './contracts';
import { hamming, classify } from './imagehash';

type Key = { id: string; privPem: string } | null;

/* ------------------------------------------------------------------ IDs */

/** Atomic counter: one statement, safe under concurrent inserts. IDs may skip if a later step fails. */
export async function nextRecordId(db: Db, year = 2026): Promise<string> {
  const r = await db.execute(
    `INSERT INTO counters (name, value) VALUES ('record', 1)
     ON CONFLICT(name) DO UPDATE SET value = value + 1 RETURNING value`,
  );
  const n = Number(r.rows[0].value);
  return `MDR-${year}-${String(n).padStart(4, '0')}`;
}

/* ------------------------------------------------------------ validation */

export interface CreateInput {
  title: string; workType: string; region: string; language?: string;
  culturalContext: string; contextSources: string[]; sourceUrl?: string;
  sensitivity: Sensitivity; submissionBasis: Basis;
  licence: LicenceId; licenceSourceNote: string; attributionRequired: boolean;
  permissions: Record<Capability, CulturalState>; custodian?: string;
  credits: Array<{ name: string; role: string; collective?: boolean }>;
  asset: { location: string; mime: string; alt: string; sourceNote?: string; sha256: string; dhash: string; width: number; height: number; bytes: number };
  honeypot?: string;
}

const STATES: CulturalState[] = ['permitted', 'not_permitted', 'unspecified'];
const SENS: Sensitivity[] = ['public', 'handle_with_care', 'restricted'];
const BASES: Basis[] = ['creator_submitted', 'custodian_submitted', 'compiled_from_public_sources'];

export function validateCreate(i: CreateInput): Record<string, string> {
  const e: Record<string, string> = {};
  const t = (s: unknown) => (typeof s === 'string' ? s.trim() : '');
  if (t(i.title).length < 3 || t(i.title).length > 160) e.title = 'Enter a title of 3 to 160 characters.';
  if (!t(i.workType)) e.workType = 'Choose the type of work.';
  if (!t(i.region)) e.region = 'Enter the region.';
  if (t(i.culturalContext).length < 20) e.culturalContext = 'Write at least a couple of sentences of cultural context, in your own words.';
  if (i.submissionBasis === 'compiled_from_public_sources' && !(i.contextSources ?? []).some((s) => t(s)))
    e.contextSources = 'Add at least one source for a compiled record.';
  if (!BASES.includes(i.submissionBasis)) e.submissionBasis = 'Choose how this record was prepared.';
  if (!SENS.includes(i.sensitivity)) e.sensitivity = 'Choose a sensitivity level.';
  if (!LICENCE_IDS.includes(i.licence)) e.licence = 'Choose the licence that applies to the image file.';
  if (!t(i.licenceSourceNote)) e.licenceSourceNote = 'Say where the image and its licence come from.';
  const credits = (i.credits ?? []).filter((c) => t(c.name) && t(c.role));
  if (!credits.length) e.credits = 'Credit at least one person, group or community, with a role.';
  for (const c of CAPABILITIES) if (!STATES.includes(i.permissions?.[c])) e[`perm_${c}`] = 'Choose a state.';
  if (!i.asset) e.asset = 'Add an image.';
  else if (!t(i.asset.alt)) e.alt = 'Describe the image for people who cannot see it.';
  return e;
}

/* ----------------------------------------------------------- audit helper */

async function lastEvent(db: Db, recordId: string): Promise<{ seq: number; hash: string }> {
  const r = await db.execute('SELECT seq, hash FROM audit_events WHERE record_id = ? ORDER BY seq DESC LIMIT 1', [recordId]);
  return r.rows[0] ? { seq: Number(r.rows[0].seq), hash: String(r.rows[0].hash) } : { seq: 0, hash: GENESIS };
}

const insertEvent = (e: Omit<AuditRow, 'id'>): Stmt => ({
  sql: `INSERT INTO audit_events (record_id, seq, actor_role, actor_name, action, diff_json, prev_hash, hash, signature, key_id, created_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
  args: [e.record_id, e.seq, e.actor_role, e.actor_name, e.action, e.diff_json, e.prev_hash, e.hash, e.signature, e.key_id, e.created_at],
});

/** Applies `stmts` and appends the given events in ONE transaction. Public fields only in diffs. */
async function applyWithEvents(
  db: Db, recordId: string, stmts: Stmt[],
  events: Array<{ actor: Actor; action: string; diff: unknown }>, key: Key,
) {
  const last = await lastEvent(db, recordId);
  let prev = last.hash, seq = last.seq;
  const inserts: Stmt[] = [];
  for (const ev of events) {
    seq += 1;
    const row = newEvent({ record_id: recordId, seq, actor_role: ev.actor.role, actor_name: ev.actor.name, action: ev.action, diff: ev.diff }, prev, key);
    inserts.push(insertEvent(row));
    prev = row.hash;
  }
  await db.batch([...stmts, ...inserts]);
}

/* -------------------------------------------------------------- create */

export async function createRecord(
  db: Db, input: CreateInput, actor: Actor,
  opts: { key?: Key; id?: string; publishAs?: Actor; isDemo?: boolean } = {},
): Promise<ActionResult> {
  if (input.honeypot) return { ok: true, id: 'MDR-0000-0000' }; // silently drop bots
  const fieldErrors = validateCreate(input);
  if (Object.keys(fieldErrors).length) return { ok: false, error: 'Please fix the highlighted fields.', fieldErrors };

  const id = opts.id ?? (await nextRecordId(db));
  const now = new Date().toISOString();
  const publish = !!opts.publishAs;
  const credits = input.credits.filter((c) => c.name.trim() && c.role.trim());
  const p = input.permissions;

  const stmts: Stmt[] = [
    {
      sql: `INSERT INTO records (id,title,work_type,region,language,cultural_context,context_sources_json,source_url,sensitivity,submission_basis,
              status,verification_level,disputed,attribution_required,licence,licence_source_note,
              perm_share,perm_commercial,perm_adapt,perm_ai_training,custodian,is_demo,created_at,published_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?, 'unverified',0,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        id, input.title.trim(), input.workType.trim(), input.region.trim(), (input.language ?? '').trim(),
        input.culturalContext.trim(), JSON.stringify(input.contextSources.filter((s) => s.trim())), (input.sourceUrl ?? '').trim(),
        input.sensitivity, input.submissionBasis, publish ? 'published' : 'pending',
        input.attributionRequired ? 1 : 0, input.licence, input.licenceSourceNote.trim(),
        p.share, p.commercial, p.adapt, p.ai_training, (input.custodian ?? '').trim(),
        opts.isDemo ? 1 : 0, now, publish ? now : null,
      ],
    },
    ...credits.map((c, idx): Stmt => ({
      sql: 'INSERT INTO credits (record_id,name,role,collective,position) VALUES (?,?,?,?,?)',
      args: [id, c.name.trim(), c.role.trim(), c.collective ? 1 : 0, idx],
    })),
    {
      sql: `INSERT INTO assets (id,record_id,location,mime,alt,source_note,sha256,dhash,width,height,bytes) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      args: [randomUUID(), id, input.asset.location, input.asset.mime, input.asset.alt.trim(), (input.asset.sourceNote ?? '').trim(),
        input.asset.sha256, input.asset.dhash, input.asset.width, input.asset.height, input.asset.bytes],
    },
  ];
  const events: Array<{ actor: Actor; action: string; diff: unknown }> = [
    { actor, action: 'create', diff: { title: input.title.trim(), status: 'pending', licence: input.licence, submissionBasis: input.submissionBasis, credits: credits.length } },
  ];
  if (publish) events.push({ actor: opts.publishAs!, action: 'approve', diff: { status: 'published' } });
  await applyWithEvents(db, id, stmts, events, opts.key ?? null);
  return { ok: true, id };
}

/* --------------------------------------------------------------- flags */

export interface FlagInput { recordId: string; type: 'missing_attribution' | 'suspected_reuse' | 'correction_request'; text: string; contact?: string; honeypot?: string }
const FLAG_TYPES = ['missing_attribution', 'suspected_reuse', 'correction_request'];

export async function submitFlag(db: Db, i: FlagInput, key: Key = null): Promise<ActionResult> {
  if (i.honeypot) return { ok: true };
  if (!FLAG_TYPES.includes(i.type)) return { ok: false, error: 'Choose a report type.', fieldErrors: { type: 'Choose a report type.' } };
  if (i.text.trim().length < 10) return { ok: false, error: 'Please describe the issue (at least 10 characters).', fieldErrors: { text: 'Please describe the issue (at least 10 characters).' } };
  const rec = await db.execute("SELECT id FROM records WHERE id = ? AND status = 'published'", [i.recordId]);
  if (!rec.rows[0]) return { ok: false, error: 'Record not found.' };
  const flagId = randomUUID();
  await applyWithEvents(
    db, i.recordId,
    [
      { sql: 'INSERT INTO flags (id,record_id,type,text,reporter_contact,status,created_at) VALUES (?,?,?,?,?,?,?)', args: [flagId, i.recordId, i.type, i.text.trim().slice(0, 2000), (i.contact ?? '').trim().slice(0, 200), 'open', new Date().toISOString()] },
      { sql: 'UPDATE records SET disputed = 1 WHERE id = ?', args: [i.recordId] },
    ],
    // Reporter contact and flag text never enter the public diff.
    [{ actor: { role: 'public', name: 'Anonymous reporter' }, action: 'flag_opened', diff: { flagId, type: i.type } }],
    key,
  );
  return { ok: true, id: flagId };
}

/* -------------------------------------------------------------- review */

export type ReviewInput =
  | { recordId: string; action: 'approve' | 'needsChanges' | 'remove'; note?: string }
  | { recordId: string; action: 'verify'; evidence: { source: string; url?: string; note: string } }
  | { recordId: string; action: 'resolveFlag'; flagId: string; note: string; outcome?: 'resolved' | 'dismissed' };

export async function reviewAction(db: Db, actor: (Actor) | null, i: ReviewInput, key: Key = null): Promise<ActionResult> {
  const who = requireRole(actor, ['reviewer', 'admin']); // throws AuthError 401/403
  const rec = await db.execute('SELECT id, status FROM records WHERE id = ?', [i.recordId]);
  if (!rec.rows[0]) return { ok: false, error: 'Record not found.' };
  const now = new Date().toISOString();

  switch (i.action) {
    case 'approve':
    case 'needsChanges':
    case 'remove': {
      const status: Status = i.action === 'approve' ? 'published' : i.action === 'remove' ? 'removed' : 'needs_changes';
      await applyWithEvents(
        db, i.recordId,
        [{ sql: 'UPDATE records SET status = ?, published_at = COALESCE(published_at, ?) WHERE id = ?', args: [status, status === 'published' ? now : null, i.recordId] }],
        [{ actor: who, action: i.action === 'approve' ? 'approve' : i.action === 'remove' ? 'remove' : 'needs_changes', diff: { status } }],
        key,
      );
      return { ok: true };
    }
    case 'verify': {
      const ev = i.evidence;
      if (!ev?.source?.trim() || !ev?.note?.trim()) return { ok: false, error: 'Verification needs an evidence source and a note.' };
      await applyWithEvents(
        db, i.recordId,
        [
          { sql: "UPDATE records SET verification_level = 'verified' WHERE id = ?", args: [i.recordId] },
          { sql: 'INSERT INTO verifications (record_id,source,url,note,reviewer,created_at) VALUES (?,?,?,?,?,?)', args: [i.recordId, ev.source.trim(), (ev.url ?? '').trim(), ev.note.trim(), who.name, now] },
        ],
        [{ actor: who, action: 'verify', diff: { verificationLevel: 'verified', evidenceSource: ev.source.trim() } }],
        key,
      );
      return { ok: true };
    }
    case 'resolveFlag': {
      if (!i.note?.trim()) return { ok: false, error: 'Add a resolution note.' };
      const f = await db.execute("SELECT id FROM flags WHERE id = ? AND record_id = ? AND status = 'open'", [i.flagId, i.recordId]);
      if (!f.rows[0]) return { ok: false, error: 'Open flag not found.' };
      const open = await db.execute("SELECT COUNT(*) AS n FROM flags WHERE record_id = ? AND status = 'open'", [i.recordId]);
      const stillDisputed = Number(open.rows[0].n) - 1 > 0 ? 1 : 0;
      const outcome = i.outcome ?? 'resolved';
      await applyWithEvents(
        db, i.recordId,
        [
          { sql: 'UPDATE flags SET status = ?, resolution_note = ? WHERE id = ?', args: [outcome, i.note.trim(), i.flagId] },
          { sql: 'UPDATE records SET disputed = ? WHERE id = ?', args: [stillDisputed, i.recordId] },
        ],
        [{ actor: who, action: 'flag_resolved', diff: { flagId: i.flagId, outcome } }],
        key,
      );
      return { ok: true };
    }
  }
}

/* ---------------------------------------------------------------- reads */

const permsOf = (r: Row): Record<Capability, CulturalState> => ({
  share: r.perm_share, commercial: r.perm_commercial, adapt: r.perm_adapt, ai_training: r.perm_ai_training,
});

export async function listRecords(db: Db, opts: { reviewer?: boolean } = {}): Promise<RecordSummary[]> {
  const where = opts.reviewer ? "status != 'removed'" : "status = 'published'";
  const recs = (await db.execute(`SELECT * FROM records WHERE ${where} ORDER BY created_at DESC, id DESC`)).rows;
  const credits = (await db.execute('SELECT * FROM credits ORDER BY record_id, position')).rows;
  const assets = (await db.execute('SELECT id, record_id, alt FROM assets')).rows;
  return recs.map((r) => {
    const cs = credits.filter((c) => c.record_id === r.id);
    const a = assets.find((x) => x.record_id === r.id);
    const hidden = r.sensitivity === 'restricted' && !opts.reviewer;
    return {
      id: r.id, title: r.title, workType: r.work_type, region: r.region,
      primaryCredit: cs[0]?.name ?? '', parties: cs.map((c) => c.name as string),
      thumbUrl: a && !hidden ? `/api/assets/${a.id}` : null, alt: a?.alt ?? '',
      permissions: permsOf(r), verificationLevel: r.verification_level,
    };
  });
}

export async function getRecordView(db: Db, id: string, opts: { reviewer?: boolean } = {}): Promise<RecordView | null> {
  const r = (await db.execute('SELECT * FROM records WHERE id = ?', [id])).rows[0];
  if (!r) return null;
  if (!opts.reviewer && r.status !== 'published') return null;
  const credits = (await db.execute('SELECT name, role, collective FROM credits WHERE record_id = ? ORDER BY position', [id])).rows;
  const a = (await db.execute('SELECT * FROM assets WHERE record_id = ?', [id])).rows[0];
  const last = await lastEvent(db, id);
  const hidden = r.sensitivity === 'restricted' && !opts.reviewer;
  return {
    id: r.id, title: r.title, workType: r.work_type, region: r.region, language: r.language,
    culturalContext: r.cultural_context, contextSources: JSON.parse(r.context_sources_json), sourceUrl: r.source_url,
    sensitivity: r.sensitivity, submissionBasis: r.submission_basis, status: r.status,
    verificationLevel: r.verification_level, disputed: !!r.disputed,
    credits: credits.map((c) => ({ name: c.name, role: c.role, collective: !!c.collective })),
    licence: r.licence, attributionRequired: !!r.attribution_required, custodian: r.custodian,
    permissions: permsOf(r),
    asset: a ? { displayUrl: hidden ? null : `/api/assets/${a.id}`, alt: a.alt, sourceNote: a.source_note, hidden } : null,
    latestAuditHash: last.seq ? last.hash : null, publishedAt: r.published_at, isDemo: !!r.is_demo,
  };
}

export async function getAsset(db: Db, assetId: string, opts: { reviewer?: boolean } = {}) {
  const r = (await db.execute(
    `SELECT a.*, r.sensitivity, r.status, r.perm_ai_training FROM assets a JOIN records r ON r.id = a.record_id WHERE a.id = ?`, [assetId])).rows[0];
  if (!r) return null;
  if (!opts.reviewer && (r.status !== 'published' || r.sensitivity === 'restricted')) return null;
  return { location: r.location as string, mime: r.mime as string, permAiTraining: (r.perm_ai_training as string) || 'unspecified' };
}

export async function auditRows(db: Db, id: string): Promise<AuditRow[]> {
  const rows = (await db.execute('SELECT * FROM audit_events WHERE record_id = ? ORDER BY seq', [id])).rows;
  return rows.map((r) => ({ ...r, seq: Number(r.seq), id: Number(r.id) })) as AuditRow[];
}

export async function verifyRecord(db: Db, id: string, pubKeys: Record<string, string>): Promise<VerifyResult> {
  return verifyChain(await auditRows(db, id), pubKeys);
}

const SUMMARY: Record<string, string> = {
  create: 'Record submitted for review',
  approve: 'Record approved and published',
  needs_changes: 'Reviewer asked for changes',
  remove: 'Record removed from public view',
  verify: 'Record verified against evidence',
  flag_opened: 'A report was filed',
  flag_resolved: 'A report was resolved',
};

export async function getTimeline(db: Db, id: string, pubKeys: Record<string, string>): Promise<TimelineItem[]> {
  const rows = await auditRows(db, id);
  const v = verifyChain(rows, pubKeys);
  return rows.map((r) => ({
    seq: r.seq, at: r.created_at, role: r.actor_role, actor: r.actor_name, action: r.action,
    summary: SUMMARY[r.action] ?? r.action,
    hashOk: v.ok ? true : r.seq < v.brokenAt ? true : false,
  }));
}

export async function listFlags(db: Db, actor: Actor | null, status: 'open' | 'all' = 'open') {
  requireRole(actor, ['reviewer', 'admin']);
  const rows = (await db.execute(
    `SELECT f.*, r.title FROM flags f JOIN records r ON r.id = f.record_id ${status === 'open' ? "WHERE f.status = 'open'" : ''} ORDER BY f.created_at DESC`)).rows;
  return rows;
}

/* --------------------------------------------------------------- match */

export interface MatchResult {
  exact?: { id: string; title: string };
  possible: Array<{ id: string; title: string; distance: number; band: 'strong' | 'possible'; primaryCredit: string }>;
}
export async function findMatches(db: Db, sha256: string, dhash: string): Promise<MatchResult> {
  const rows = (await db.execute(
    `SELECT a.sha256, a.dhash, r.id, r.title FROM assets a JOIN records r ON r.id = a.record_id
     WHERE r.status = 'published' AND r.sensitivity != 'restricted'`)).rows;
  const credits = (await db.execute('SELECT record_id, name FROM credits WHERE position = 0')).rows;
  const out: MatchResult = { possible: [] };
  for (const r of rows) {
    if (r.sha256 === sha256) out.exact = { id: r.id, title: r.title };
    const d = hamming(r.dhash, dhash);
    const band = classify(d);
    if (band !== 'none')
      out.possible.push({ id: r.id, title: r.title, distance: d, band, primaryCredit: credits.find((c) => c.record_id === r.id)?.name ?? '' });
  }
  out.possible.sort((a, b) => a.distance - b.distance);
  return out;
}
