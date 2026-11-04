import type { Db } from './types';
import { migrate } from './schema';

let cached: Promise<Db> | null = null;

/** Server-only. Picks libSQL (file: or Turso URL). Migrates once per process. */
export function getDb(): Promise<Db> {
  if (!cached) {
    cached = (async () => {
      const url = process.env.DATABASE_URL || 'file:./data/mudra.db';
      const { libsqlDb } = await import('./libsql-adapter');
      const db = libsqlDb(url, process.env.DATABASE_AUTH_TOKEN);
      await migrate(db);
      return db;
    })();
  }
  return cached;
}
