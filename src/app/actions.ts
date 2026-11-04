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
