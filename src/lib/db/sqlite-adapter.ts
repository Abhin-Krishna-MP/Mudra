import { DatabaseSync } from 'node:sqlite';
import type { Db, Stmt, Row } from './types';

/** Node-only adapter used by tests and scripts. */
export function sqliteDb(path = ':memory:'): Db & { raw: DatabaseSync } {
  const raw = new DatabaseSync(path);
  raw.exec('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
  return {
    raw,
    async execute(sql, args = []) {
      const st = raw.prepare(sql);
      if (/^\s*(select|with|pragma)/i.test(sql) || /\breturning\b/i.test(sql)) return { rows: st.all(...args) as Row[] };
      st.run(...args);
      return { rows: [] };
    },
    async batch(stmts: Stmt[]) {
      raw.exec('BEGIN');
      try {
        for (const s of stmts) raw.prepare(s.sql).run(...(s.args ?? []));
        raw.exec('COMMIT');
      } catch (e) {
        raw.exec('ROLLBACK');
        throw e;
      }
    },
  };
}
