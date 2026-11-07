import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sqliteDb } from '../src/lib/db/sqlite-adapter';
import { migrate } from '../src/lib/db/schema';
import { canSubmit, safeNext, SUBMIT_ROLES } from '../src/lib/auth';

test('only the author role may submit', () => {
  assert.deepEqual([...SUBMIT_ROLES], ['author']);
  assert.equal(canSubmit('author'), true);
  for (const r of ['reviewer', 'admin', 'public', '', 'Author', undefined, null]) assert.equal(canSubmit(r as any), false, String(r));
});

test('new users default to the author role', async () => {
  const db = sqliteDb(); await migrate(db);
  await db.execute('INSERT INTO users (email, name, password_hash) VALUES (?,?,?)', ['a@x.org', 'A', 'h']);
  assert.equal((await db.execute('SELECT role FROM users WHERE email = ?', ['a@x.org'])).rows[0].role, 'author');
});

test('post-login redirect only allows same-site paths', () => {
  assert.equal(safeNext('/submit', '/x'), '/submit');
  for (const bad of ['//evil.com', 'https://evil.com', '/\\evil.com', 'javascript:alert(1)', '', undefined, '/a\nb']) assert.equal(safeNext(bad, '/x'), '/x', String(bad));
});
