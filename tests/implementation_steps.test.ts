import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { sqliteDb } from '../src/lib/db/sqlite-adapter';
import { migrate } from '../src/lib/db/schema';
import {
  createRecord,
  reviewAction,
  updateDraft,
  listDraftsForAuthor,
  listPendingDraftsForSteward,
  type CreateInput,
} from '../src/lib/repo';
import { storeSecureKyc, readSecureKyc } from '../src/lib/storage';
import { middleware } from '../src/middleware';
import { NextRequest } from 'next/server';

async function setupDb() {
  const db = sqliteDb();
  await migrate(db);
  return db;
}

const mockInput = (overrides: Partial<CreateInput> = {}): CreateInput => ({
  title: 'Theyyam Ritual Performance',
  workType: 'ritual',
  category: 'ritual',
  region: 'Kannur',
  culturalContext: 'A sacred ritual art form deeply rooted in North Malabar tradition.',
  contextSources: ['Local folklore archives'],
  sensitivity: 'public',
  submissionBasis: 'creator_submitted',
  licence: 'CC-BY-4.0',
  licenceSourceNote: 'Directly documented with practitioner consent',
  attributionRequired: true,
  permissions: {
    share: 'permitted',
    commercial: 'unspecified',
    adapt: 'unspecified',
    ai_training: 'not_permitted',
  },
  credits: [{ name: 'Sreedharan Panicker', role: 'Tradition Bearer' }],
  asset: {
    location: 'seed/x.png',
    mime: 'image/png',
    alt: 'Ritual dancer in ceremonial regalia',
    sha256: 'e'.repeat(64),
    dhash: '1'.repeat(16),
    width: 200,
    height: 200,
    bytes: 2048,
  },
  ...overrides,
});

test('Step 1: Role-Based Access - Users role defaults to author, author can submit', async () => {
  const db = await setupDb();

  // Test database default role on signup
  await db.execute(
    'INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)',
    ['author1@example.org', 'Author One', 'fake_hash']
  );
  const user = (await db.execute('SELECT * FROM users WHERE email = ?', ['author1@example.org'])).rows[0];
  assert.equal(user.role, 'author', 'New user role must default to author');

  // Verify author can create a draft record
  const res = await createRecord(
    db,
    mockInput({ authorId: Number(user.id) }),
    { role: 'author', name: 'Author One', id: Number(user.id) }
  );
  assert.equal(res.ok, true);
  assert.ok(res.id);

  // Non-author cannot perform reviewer actions
  await assert.rejects(
    () => reviewAction(db, { role: 'author', name: 'Author One' }, { recordId: res.id!, action: 'approve' }),
    /Not allowed/
  );
});

test('Step 2: Specific Steward Routing - Tag Matching by region & category', async () => {
  const db = await setupDb();

  // 1. Create a Steward specialized in Kannur + ritual
  await db.execute(
    'INSERT INTO users (email, name, role, password_hash, region, category) VALUES (?, ?, ?, ?, ?, ?)',
    ['steward.kannur@mudra.demo', 'Kannur Ritual Steward', 'steward', 'hash', 'Kannur', 'ritual']
  );

  // 2. Submit matching draft (Kannur + ritual)
  const draft1 = await createRecord(
    db,
    mockInput({ title: 'Kannur Theyyam', region: 'Kannur', category: 'ritual', workType: 'ritual' }),
    { role: 'author', name: 'Author' }
  );

  // 3. Submit non-matching draft (Thrissur + performing)
  const draft2 = await createRecord(
    db,
    mockInput({ title: 'Thrissur Pooram Melam', region: 'Thrissur', category: 'performing', workType: 'performing' }),
    { role: 'author', name: 'Author' }
  );

  // 4. Query drafts routed to this steward
  const routedDrafts = await listPendingDraftsForSteward(db, { region: 'Kannur', category: 'ritual' });
  const routedIds = routedDrafts.map((d) => d.id);

  assert.ok(routedIds.includes(draft1.id!), 'Draft matching region & category must route to Steward');
  assert.ok(!routedIds.includes(draft2.id!), 'Draft with different region/category must NOT route to Steward');
});

test('Step 3: Steward KYC Verification - Private storage and Admin approval', async () => {
  const db = await setupDb();

  // 1. Author user exists
  await db.execute(
    'INSERT INTO users (email, name, role, password_hash) VALUES (?, ?, ?, ?)',
    ['applicant@example.org', 'Applicant Author', 'author', 'hash']
  );
  const applicant = (await db.execute('SELECT * FROM users WHERE email = ?', ['applicant@example.org'])).rows[0];

  // 2. Secure file storage test - must be saved in private storage, NOT public folder
  const dummyDoc = Buffer.from('FAKE-GOVT-ID-DOCUMENT-CONTENT');
  const docSha = 'd'.repeat(64);
  const docLocation = await storeSecureKyc(dummyDoc, docSha, 'image/jpeg');

  // Verify path is private and not inside public/
  assert.ok(docLocation.startsWith('private://') || docLocation.startsWith('supabase://'));
  const localFile = join(process.cwd(), 'data', 'secure_kyc', `${docSha}.jpg`);
  const publicFile = join(process.cwd(), 'public', 'uploads', `${docSha}.jpg`);
  assert.equal(existsSync(localFile), true, 'Must be stored in data/secure_kyc');
  assert.equal(existsSync(publicFile), false, 'Must NOT be in public folder');

  // Verify private reader works
  const retrieved = await readSecureKyc(docLocation);
  assert.ok(retrieved);
  assert.equal(retrieved.toString(), 'FAKE-GOVT-ID-DOCUMENT-CONTENT');

  // 3. Insert into steward_applications with status pending
  const appRes = await db.execute(
    `INSERT INTO steward_applications (user_id, id_document_url, region, category, status, created_at)
     VALUES (?, ?, ?, ?, 'pending', ?) RETURNING id`,
    [applicant.id, docLocation, 'Kannur', 'ritual', new Date().toISOString()]
  );
  const appId = Number(appRes.rows[0].id);

  // 4. Admin approval changes role in users table to steward
  await db.execute("UPDATE steward_applications SET status = 'approved' WHERE id = ?", [appId]);
  await db.execute("UPDATE users SET role = 'steward', region = 'Kannur', category = 'ritual' WHERE id = ?", [applicant.id]);

  const updatedUser = (await db.execute('SELECT role, region, category FROM users WHERE id = ?', [applicant.id])).rows[0];
  assert.equal(updatedUser.role, 'steward', 'Admin approval must upgrade applicant role to steward');
  assert.equal(updatedUser.region, 'Kannur');
  assert.equal(updatedUser.category, 'ritual');
});

test('Step 4: AI Shield (TDMRep Protocol) - Static manifest and header injection on /uploads/', () => {
  // 1. Static manifest check
  const manifestPath = join(process.cwd(), 'public', '.well-known', 'tdmrep.json');
  assert.equal(existsSync(manifestPath), true, 'Static manifest /.well-known/tdmrep.json must exist');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest['tdm-reservation'], 1, 'Manifest must declare tdm-reservation: 1');

  // 2. Middleware interception on /uploads/
  const req = new NextRequest('http://localhost:3000/uploads/test-image.jpg');
  const res = middleware(req);
  assert.equal(res.headers.get('tdm-reservation'), '1', 'Server must inject tdm-reservation: 1 on image requests');
});

test('Step 5: Asynchronous Feedback - Request Revision & Author Edit/Resubmit', async () => {
  const db = await setupDb();

  // Create an author and submit a draft
  await db.execute(
    'INSERT INTO users (email, name, role, password_hash) VALUES (?, ?, ?, ?)',
    ['author.revision@example.org', 'Revision Author', 'author', 'hash']
  );
  const author = (await db.execute('SELECT * FROM users WHERE email = ?', ['author.revision@example.org'])).rows[0];

  const draft = await createRecord(
    db,
    mockInput({ authorId: Number(author.id), title: 'Initial Draft Title' }),
    { role: 'author', name: 'Revision Author', id: Number(author.id) }
  );
  const recordId = draft.id!;

  // Steward requests revision with specific notes
  const steward = { role: 'steward', name: 'Steward Anoop' };
  const revRes = await reviewAction(
    db,
    steward,
    { recordId, action: 'requestRevision', note: 'Please provide more details on the temple lineage.' }
  );
  assert.equal(revRes.ok, true);

  // Check draft status and revision_note in database
  const draftRow = (await db.execute('SELECT status, revision_note FROM records WHERE id = ?', [recordId])).rows[0];
  assert.equal(draftRow.status, 'needs_revision', 'Draft status must change to needs_revision');
  assert.equal(draftRow.revision_note, 'Please provide more details on the temple lineage.');

  // Author sees draft on author dashboard
  const authorDrafts = await listDraftsForAuthor(db, Number(author.id));
  const flaggedDraft = authorDrafts.find((d) => d.id === recordId);
  assert.ok(flaggedDraft);
  assert.equal(flaggedDraft.status, 'needs_revision');
  assert.equal(flaggedDraft.revisionNote, 'Please provide more details on the temple lineage.');

  // Author edits and resubmits
  const updateRes = await updateDraft(
    db,
    recordId,
    { title: 'Corrected Theyyam Record', culturalContext: 'Updated context with temple lineage documented.' },
    { role: 'author', name: 'Revision Author', id: Number(author.id) }
  );
  assert.equal(updateRes.ok, true);

  // Resubmit must reset status to pending and clear revision note
  const resubmittedRow = (await db.execute('SELECT status, revision_note, title FROM records WHERE id = ?', [recordId])).rows[0];
  assert.equal(resubmittedRow.status, 'pending', 'Resubmit must reset status to pending');
  assert.equal(resubmittedRow.revision_note, '', 'Resubmit must clear previous revision note');
  assert.equal(resubmittedRow.title, 'Corrected Theyyam Record');
});
