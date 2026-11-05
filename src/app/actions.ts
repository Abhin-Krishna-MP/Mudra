'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { createRecord, submitFlag, reviewAction, type CreateInput, type FlagInput, type ReviewInput } from '@/lib/repo';
import { processImage } from '@/lib/imagehash';
import { storeUpload } from '@/lib/storage';
import { signingKey } from '@/lib/signing';
import { AuthError, checkPassword } from '@/lib/auth';
import { getActor, startSession, endSession } from '@/lib/session';
import type { ActionResult } from '@/lib/contracts';
import type { Capability, CulturalState } from '@/lib/permissions';
import { createPermissionRequest, decideRequest, revokeGrant, assignSteward, type RequestInput, type DecisionInput } from '@/lib/repo-grants';

const str = (f: FormData, k: string) => String(f.get(k) ?? '');

/* ---------------------------------------------------------------- submit */
export async function createRecordAction(_prev: ActionResult | null, f: FormData): Promise<ActionResult> {
  const db = await getDb();
  const file = f.get('image');
  let asset: CreateInput['asset'] | undefined;
  if (file instanceof File && file.size > 0) {
    try {
      const p = await processImage(Buffer.from(await file.arrayBuffer()));
      const location = await storeUpload(p.buffer, p.sha256, p.mime);
      asset = { location, mime: p.mime, alt: str(f, 'alt'), sourceNote: str(f, 'imageSourceNote'), sha256: p.sha256, dhash: p.dhash, width: p.width, height: p.height, bytes: p.bytes };
    } catch (e) {
      return { ok: false, error: 'Please fix the highlighted fields.', fieldErrors: { asset: (e as Error).message } };
    }
  }
  const credits = [0, 1, 2, 3].map((i) => ({ name: str(f, `credit_name_${i}`), role: str(f, `credit_role_${i}`), collective: f.get(`credit_collective_${i}`) === 'on' }));
  const perm = (k: string) => (str(f, `perm_${k}`) || 'unspecified') as CulturalState;
  const input: CreateInput = {
    title: str(f, 'title'), workType: str(f, 'workType'), region: str(f, 'region'), language: str(f, 'language'),
    culturalContext: str(f, 'culturalContext'), contextSources: str(f, 'contextSources').split('\n').map((s) => s.trim()).filter(Boolean),
    sourceUrl: str(f, 'sourceUrl'), sensitivity: str(f, 'sensitivity') as CreateInput['sensitivity'],
    submissionBasis: str(f, 'submissionBasis') as CreateInput['submissionBasis'], licence: str(f, 'licence') as CreateInput['licence'],
    licenceSourceNote: str(f, 'licenceSourceNote'), attributionRequired: f.get('attributionRequired') === 'on', custodian: str(f, 'custodian'),
    permissions: { share: perm('share'), commercial: perm('commercial'), adapt: perm('adapt'), ai_training: perm('ai_training') } as Record<Capability, CulturalState>,
    credits, asset: asset as CreateInput['asset'], honeypot: str(f, 'website'),
  };
  const res = await createRecord(db, input, { role: 'public', name: 'Submitter' }, { key: signingKey() });
  if (!res.ok) return res;
  redirect(`/submit?done=${encodeURIComponent(res.id!)}`);
}

/* ----------------------------------------------------------------- flags */
export async function submitFlagAction(_prev: ActionResult | null, f: FormData): Promise<ActionResult> {
  const input: FlagInput = {
    recordId: str(f, 'recordId'), type: str(f, 'type') as FlagInput['type'], text: str(f, 'text'), contact: str(f, 'contact'), honeypot: str(f, 'website'),
  };
  const res = await submitFlag(await getDb(), input, signingKey());
  if (!res.ok) return res;
  redirect(`/r/${input.recordId}/report?sent=1`);
}

/* ---------------------------------------------------------------- review */
const hits = new Map<string, { n: number; t: number }>();
export async function loginAction(_prev: ActionResult | null, f: FormData): Promise<ActionResult> {
  const email = str(f, 'email').trim().toLowerCase();
  const h = hits.get(email) ?? { n: 0, t: Date.now() };
  if (Date.now() - h.t > 15 * 60_000) { h.n = 0; h.t = Date.now(); }
  if (h.n >= 8) return { ok: false, error: 'Too many attempts. Try again in a few minutes.' }; // best-effort limiter
  const db = await getDb();
  const u = (await db.execute('SELECT * FROM users WHERE email = ?', [email])).rows[0];
  if (!u || !checkPassword(str(f, 'password'), u.password_hash)) {
    hits.set(email, { n: h.n + 1, t: h.t });
    return { ok: false, error: 'Email or password is not right.' };
  }
  await startSession({ id: Number(u.id), name: u.name, role: u.role });
  redirect('/review');
}
export async function logoutAction() { await endSession(); redirect('/review'); }

export async function reviewFormAction(f: FormData) {
  const recordId = str(f, 'recordId');
  const action = str(f, 'action');
  let input: ReviewInput;
  if (action === 'verify') input = { recordId, action, evidence: { source: str(f, 'source'), url: str(f, 'url'), note: str(f, 'note') } };
  else if (action === 'resolveFlag') input = { recordId, action, flagId: str(f, 'flagId'), note: str(f, 'note') };
  else if (action === 'approve' || action === 'needsChanges' || action === 'remove') input = { recordId, action, note: str(f, 'note') };
  else redirect('/review?msg=Unknown+action');
  let msg = 'Done.';
  try {
    const res = await reviewAction(await getDb(), await getActor(), input!, signingKey());
    if (!res.ok) msg = res.error ?? 'Could not complete that action.';
  } catch (e) {
    if (e instanceof AuthError) redirect('/review');
    throw e;
  }
  revalidatePath('/');
  revalidatePath(`/r/${recordId}`);
  redirect(`/review?msg=${encodeURIComponent(msg)}`);
}

/* ------------------------------------------------- permission requests */
export async function requestPermissionAction(_prev: ActionResult | null, f: FormData): Promise<ActionResult> {
  const recordId = String(f.get('recordId') ?? '');
  const input: RequestInput = {
    recordId,
    useKey: String(f.get('useKey') ?? 'general'),
    requesterName: String(f.get('requesterName') ?? ''),
    requesterContact: String(f.get('requesterContact') ?? ''),
    whatYouWillMake: String(f.get('whatYouWillMake') ?? ''),
    whereAndHowLong: String(f.get('whereAndHowLong') ?? ''),
    honeypot: String(f.get('website') ?? ''),
  };
  const res = await createPermissionRequest(await getDb(), input, signingKey());
  if (!res.ok) return res;
  redirect(`/request/${res.token}?sent=1`);
}

export async function grantDecisionAction(f: FormData): Promise<void> {
  const actor = await getActor();
  const input: DecisionInput = {
    requestId: String(f.get('requestId') ?? ''),
    decision: (f.get('decision') === 'granted' ? 'granted' : 'declined') as 'granted' | 'declined',
    note: String(f.get('note') ?? ''),
    conditions: String(f.get('conditions') ?? '').split('\n').map((s) => s.trim()).filter(Boolean),
    creditText: String(f.get('creditText') ?? ''),
    validFrom: String(f.get('validFrom') ?? new Date().toISOString()),
    validUntil: String(f.get('validUntil') ?? '') || undefined,
  };
  const res = await decideRequest(await getDb(), actor, input, signingKey());
  revalidatePath('/review');
  if (!res.ok) redirect(`/review?msg=${encodeURIComponent(res.error)}`);
  redirect(`/review?msg=Decision+recorded.`);
}

export async function revokeGrantAction(f: FormData): Promise<void> {
  const actor = await getActor();
  const requestId = String(f.get('requestId') ?? '');
  const note = String(f.get('note') ?? 'Revoked by reviewer.');
  await revokeGrant(await getDb(), actor, requestId, note, signingKey());
  revalidatePath('/review');
  redirect('/review?msg=Grant+revoked.');
}

export async function assignStewardAction(f: FormData): Promise<void> {
  const actor = await getActor();
  const recordId = String(f.get('recordId') ?? '');
  const userId = Number(f.get('userId'));
  await assignSteward(await getDb(), actor, recordId, userId);
  revalidatePath(`/review`);
  redirect('/review?msg=Steward+assigned.');
}

/* --------------------------------------------------- sandbox tamper simulation */
export async function simulateTamperAction(recordId: string, tampered: boolean) {
  const db = await getDb();
  const { getRecordView, auditRows, verifyRecord } = await import('@/lib/repo');
  const v = await getRecordView(db, recordId);
  if (!v?.isDemo) throw new Error('Simulation only permitted on sandbox demo record');
  const rows = await auditRows(db, recordId);
  if (tampered && rows.length >= 2) {
    const copy = JSON.parse(JSON.stringify(rows));
    copy[1].diff_json = JSON.stringify({ status: 'removed' });
    const { verifyChain } = await import('@/lib/chain');
    return { ok: true, result: verifyChain(copy), rows: copy };
  }
  const { publicKeys } = await import('@/lib/signing');
  return { ok: true, result: await verifyRecord(db, recordId, publicKeys()), rows };
}
