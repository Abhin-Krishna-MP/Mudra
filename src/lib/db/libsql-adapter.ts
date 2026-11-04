import { createClient } from '@libsql/client';
import type { Db, Stmt } from './types';

export function libsqlDb(url: string, authToken?: string): Db {
  const c = createClient({ url, authToken: authToken || undefined });
  return {
    async execute(sql, args = []) {
      const r = await c.execute({ sql, args });
      return { rows: r.rows.map((row) => ({ ...row })) as any[] };
    },
    async batch(stmts: Stmt[]) {
      await c.batch(stmts.map((s) => ({ sql: s.sql, args: s.args ?? [] })), 'write');
    },
  };
}
