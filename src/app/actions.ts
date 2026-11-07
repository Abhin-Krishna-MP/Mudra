'use server';
import { createHash } from 'node:crypto';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { createRecord, submitFlag, reviewAction, updateDraft, type CreateInput, type FlagInput, type ReviewInput } from '@/lib/repo';
import { processImage } from '@/lib/imagehash';
import { storeUpload, storeSecureKyc } from '@/lib/storage';
import { signingKey } from '@/lib/signing';
import { AuthError, checkPassword, hashPassword, canSubmit, safeNext } from '@/lib/auth';
import { getSubmitter, UNAUTHORIZED_URL } from '@/lib/authz';
import { getActor, startSession, endSession } from '@/lib/session';
import type { ActionResult, Actor } from '@/lib/contracts';
import type { Capability, CulturalState } from '@/lib/permissions';
import { createPermissionRequest, decideRequest, revokeGrant, assignSteward, removeSteward, type RequestInput, type DecisionInput } from '@/lib/repo-grants';

const str = (f: FormData, k: string) => String(f.get(k) ?? '');

/* ---------------------------------------------------------------- submit */
export async function createRecordAction(_prev: ActionResult | null, f: FormData): Promise<ActionResult> {
  // Server actions are public POST endpoints, so the author check must be repeated here
  const submitter = await getSubmitter();
  if (!submitter) redirect(UNAUTHORIZED_URL);
  const actor: Actor = (await getActor()) ?? { role: 'author', name: submitter.name, id: submitter.id };
  const db = await getDb();
  const draftId = str(f, 'draftId');
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
  const category = (str(f, 'category') || str(f, 'workType')).trim();
  const workType = (str(f, 'workType') || category).trim();

  if (draftId) {
    // Re-submission of an edited draft flagged for revision
    const input: Partial<CreateInput> = {
      title: str(f, 'title'),
      region: str(f, 'region'),
      category,
      workType,
      language: str(f, 'language'),
      culturalContext: str(f, 'culturalContext'),
      contextSources: str(f, 'contextSources').split('\n').map((s) => s.trim()).filter(Boolean),
      sourceUrl: str(f, 'sourceUrl'),
      sensitivity: str(f, 'sensitivity') as CreateInput['sensitivity'],
      submissionBasis: str(f, 'submissionBasis') as CreateInput['submissionBasis'],
      licence: str(f, 'licence') as CreateInput['licence'],
      licenceSourceNote: str(f, 'licenceSourceNote'),
      attributionRequired: f.get('attributionRequired') === 'on',
      custodian: str(f, 'custodian'),
      credits,
      permissions: { share: perm('share'), commercial: perm('commercial'), adapt: perm('adapt'), ai_training: perm('ai_training') } as Record<Capability, CulturalState>,
    };
    const res = await updateDraft(db, draftId, input, actor, { key: signingKey() });
    if (!res.ok) return res;
    revalidatePath('/author/dashboard');
    revalidatePath('/review');
    redirect(`/author/dashboard?resubmitted=${encodeURIComponent(draftId)}`);
  }

  const input: CreateInput = {
    title: str(f, 'title'), workType, region: str(f, 'region'), category, language: str(f, 'language'),
    culturalContext: str(f, 'culturalContext'), contextSources: str(f, 'contextSources').split('\n').map((s) => s.trim()).filter(Boolean),
    sourceUrl: str(f, 'sourceUrl'), sensitivity: str(f, 'sensitivity') as CreateInput['sensitivity'],
    submissionBasis: str(f, 'submissionBasis') as CreateInput['submissionBasis'], licence: str(f, 'licence') as CreateInput['licence'],
    licenceSourceNote: str(f, 'licenceSourceNote'), attributionRequired: f.get('attributionRequired') === 'on', custodian: str(f, 'custodian'),
    permissions: { share: perm('share'), commercial: perm('commercial'), adapt: perm('adapt'), ai_training: perm('ai_training') } as Record<Capability, CulturalState>,
    credits, asset: asset as CreateInput['asset'], honeypot: str(f, 'website'),
    authorId: submitter.id,
  };
  const res = await createRecord(db, input, { role: 'author', name: submitter.name, id: submitter.id }, { key: signingKey() });
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
  const redirectTo = str(f, 'redirect');
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
  const nextTarget = str(f, 'next') || str(f, 'redirect');
  if (nextTarget) {
    redirect(safeNext(nextTarget, canSubmit(u.role) ? '/submit' : '/review'));
  }
  if (u.role === 'author') {
    redirect('/author/dashboard');
  }
  if (u.role === 'admin') {
    redirect('/admin');
  }
  redirect('/review');
}

/** Public sign-up for authors. Default role is author. */
export async function signupAction(_prev: ActionResult | null, f: FormData): Promise<ActionResult> {
  const name = str(f, 'name').trim();
  const email = str(f, 'email').trim().toLowerCase();
  const password = str(f, 'password');
  const region = str(f, 'region').trim();
  const category = str(f, 'category').trim();
  const nextTarget = str(f, 'next') || str(f, 'redirect');

  if (name.length < 2 || name.length > 80) return { ok: false, error: 'Enter your name (2 to 80 characters).' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return { ok: false, error: 'Enter a valid email address.' };
  if (password.length < 8) return { ok: false, error: 'Password must be at least 8 characters.' };

  const db = await getDb();
  if ((await db.execute('SELECT 1 FROM users WHERE email = ?', [email])).rows.length) {
    return { ok: false, error: 'An account with this email already exists. Sign in instead.' };
  }

  const pwHash = hashPassword(password);
  await db.execute(
    'INSERT INTO users (email, name, role, password_hash, region, category) VALUES (?, ?, ?, ?, ?, ?)',
    [email, name, 'author', pwHash, region, category],
  );
  const u = (await db.execute('SELECT id, name, role FROM users WHERE email = ?', [email])).rows[0];
  await startSession({ id: Number(u.id), name: String(u.name), role: 'author' });

  redirect(safeNext(nextTarget, '/submit'));
}

export async function logoutAction(f?: FormData) {
  await endSession();
  const nextTarget = f ? (f.get('next') as string) : '/login';
  redirect(safeNext(nextTarget, '/login'));
}

export async function reviewFormAction(f: FormData) {
  const recordId = str(f, 'recordId');
  const action = str(f, 'action');
  let input: ReviewInput;
  if (action === 'verify') {
    input = { recordId, action, evidence: { source: str(f, 'source'), url: str(f, 'url'), note: str(f, 'note') } };
  } else if (action === 'resolveFlag') {
    input = { recordId, action, flagId: str(f, 'flagId'), note: str(f, 'note') };
  } else if (action === 'approve' || action === 'needsChanges' || action === 'remove') {
    input = { recordId, action, note: str(f, 'note') };
  } else if (action === 'requestRevision' || action === 'needsRevision') {
    input = { recordId, action: 'requestRevision', note: str(f, 'note') };
  } else {
    redirect('/review?msg=Unknown+action');
  }
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
  revalidatePath('/author/dashboard');
  redirect(`/review?msg=${encodeURIComponent(msg)}`);
}

/* ------------------------------------------------- steward applications (KYC) */
export async function applyStewardAction(_prev: ActionResult | null, f: FormData): Promise<ActionResult> {
  const actor = await getActor();
  if (!actor || !actor.id) redirect('/login?error=Unauthorized&redirect=/apply-steward');

  const file = f.get('idDocument');
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: 'Please upload a photo of your identity document.' };
  }
  const region = str(f, 'region').trim();
  const category = str(f, 'category').trim();
  if (!region || !category) {
    return { ok: false, error: 'Please specify both your region and cultural category of expertise.' };
  }

  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const sha256 = createHash('sha256').update(buf).digest('hex');
    const location = await storeSecureKyc(buf, sha256, file.type || 'image/jpeg');

    const db = await getDb();
    const now = new Date().toISOString();
    await db.execute(
      `INSERT INTO steward_applications (user_id, id_document_url, region, category, status, created_at)
       VALUES (?, ?, ?, ?, 'pending', ?)`,
      [actor.id, location, region, category, now],
    );
  } catch (e) {
    return { ok: false, error: `Could not submit application: ${(e as Error).message}` };
  }

  revalidatePath('/apply-steward');
  redirect('/apply-steward?done=1');
}

export async function approveStewardAction(f: FormData): Promise<void> {
  const actor = await getActor();
  if (!actor || actor.role !== 'admin') redirect('/login?error=Unauthorized');

  const appId = Number(f.get('applicationId'));
  const db = await getDb();
  const app = (await db.execute('SELECT * FROM steward_applications WHERE id = ?', [appId])).rows[0];
  if (!app) redirect('/admin?msg=Application+not+found');

  const now = new Date().toISOString();
  // Approve application and change role in users table to steward
  await db.execute(
    "UPDATE steward_applications SET status = 'approved', reviewed_at = ? WHERE id = ?",
    [now, appId],
  );
  await db.execute(
    "UPDATE users SET role = 'steward', region = ?, category = ? WHERE id = ?",
    [String(app.region || ''), String(app.category || ''), app.user_id],
  );

  revalidatePath('/admin');
  revalidatePath('/admin/stewards');
  redirect('/admin?msg=Application+approved.+User+upgraded+to+Steward.');
}

export async function rejectStewardAction(f: FormData): Promise<void> {
  const actor = await getActor();
  if (!actor || actor.role !== 'admin') redirect('/login?error=Unauthorized');

  const appId = Number(f.get('applicationId'));
  const db = await getDb();
  const now = new Date().toISOString();
  await db.execute(
    "UPDATE steward_applications SET status = 'rejected', reviewed_at = ? WHERE id = ?",
    [now, appId],
  );

  revalidatePath('/admin');
  revalidatePath('/admin/stewards');
  redirect('/admin?msg=Application+rejected.');
}

/* ------------------------------------------------- permission requests */
export async function requestPermissionAction(_prev: ActionResult | null, f: FormData): Promise<ActionResult & { token?: string; requestId?: string; recordId?: string; useKey?: string }> {
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
  return { ok: true, token: res.token, requestId: res.requestId, recordId, useKey: input.useKey };
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
  const recordId = String(f.get('recordId') ?? '').trim();
  const userId = Number(f.get('userId'));
  if (!recordId || !userId || isNaN(userId)) {
    redirect('/review?msg=Please+select+both+a+record+and+a+steward.');
  }
  await assignSteward(await getDb(), actor, recordId, userId);
  revalidatePath(`/review`);
  revalidatePath(`/r/${recordId}`);
  redirect('/review?msg=Steward+assigned+successfully.');
}

export async function unassignStewardAction(f: FormData): Promise<void> {
  const actor = await getActor();
  const recordId = String(f.get('recordId') ?? '').trim();
  const userId = Number(f.get('userId'));
  if (recordId && userId && !isNaN(userId)) {
    await removeSteward(await getDb(), actor, recordId, userId);
    revalidatePath(`/review`);
    revalidatePath(`/r/${recordId}`);
    redirect('/review?msg=Steward+unassigned+successfully.');
  }
  redirect('/review?msg=Unable+to+unassign+steward.');
}

export async function createOrPromoteStewardAction(f: FormData): Promise<void> {
  const actor = await getActor();
  if (!actor || !['reviewer', 'admin', 'steward'].includes(actor.role)) {
    throw new Error('Unauthorized');
  }
  const name = String(f.get('name') ?? '').trim();
  const email = String(f.get('email') ?? '').trim().toLowerCase();
  const region = String(f.get('region') ?? '').trim();
  const category = String(f.get('category') ?? '').trim();
  const recordId = String(f.get('recordId') ?? '').trim();

  if (!name || !email) {
    redirect('/review?msg=Name+and+email+are+required+to+add+a+steward.');
  }

  const db = await getDb();
  const existing = (await db.execute('SELECT id, role FROM users WHERE email = ?', [email])).rows[0];
  let stewardUserId: number;

  if (existing) {
    stewardUserId = Number(existing.id);
    await db.execute(
      "UPDATE users SET role = 'steward', name = ?, region = ?, category = ? WHERE id = ?",
      [name, region, category, stewardUserId],
    );
  } else {
    // Generate a default demo password hash for new steward
    const passHash = 'scrypt:32768:8:1:demo-hash';
    await db.execute(
      "INSERT INTO users (name, email, role, password_hash, region, category) VALUES (?, ?, 'steward', ?, ?, ?)",
      [name, email, passHash, region, category],
    );
    const created = (await db.execute('SELECT id FROM users WHERE email = ?', [email])).rows[0];
    stewardUserId = Number(created?.id);
  }

  if (recordId && stewardUserId) {
    await assignSteward(db, actor, recordId, stewardUserId);
  }

  revalidatePath('/review');
  if (recordId) revalidatePath(`/r/${recordId}`);
  redirect('/review?msg=Steward+added+successfully.');
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
