export type Row = Record<string, any>;
export interface Stmt { sql: string; args?: any[] }
/** Minimal DB interface implemented by both the libSQL (Turso) and node:sqlite adapters. */
export interface Db {
  execute(sql: string, args?: any[]): Promise<{ rows: Row[] }>;
  /** Runs all statements atomically (one transaction). */
  batch(stmts: Stmt[]): Promise<void>;
}
