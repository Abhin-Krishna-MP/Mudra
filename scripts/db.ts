import { mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import type { Db } from '../src/lib/db/types';
import { migrate } from '../src/lib/db/schema';

if (existsSync('.env')) process.loadEnvFile('.env');

/** DB for CLI scripts: libSQL/Turso when installed, otherwise node:sqlite on the same file (same SQLite format). */
export async function scriptDb(): Promise<Db> {
  const url = process.env.DATABASE_URL || 'file:./data/mudra.db';
  let db: Db;
  try {
    const { libsqlDb } = await import('../src/lib/db/libsql-adapter');
    db = libsqlDb(url, process.env.DATABASE_AUTH_TOKEN);
    await db.execute('SELECT 1');
  } catch (e) {
    if (!url.startsWith('file:')) throw e;
    const { sqliteDb } = await import('../src/lib/db/sqlite-adapter');
    const path = url.replace(/^file:/, '');
    mkdirSync(dirname(path), { recursive: true });
    console.warn('[db] @libsql/client unavailable, using node:sqlite fallback for', path);
    db = sqliteDb(path);
  }
  await migrate(db);
  return db;
}
