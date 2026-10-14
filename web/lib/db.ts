import { Pool } from 'pg';

/** One shared connection pool per server instance (kept across hot reloads in dev). */
const g = globalThis as unknown as { __preptimePool?: Pool };

export const dbConfigured = !!process.env.DATABASE_URL;

export function getPool(): Pool {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
  if (!g.__preptimePool) {
    g.__preptimePool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Serverless: keep it tiny so a burst of invocations cannot exhaust a free-tier database.
      max: 3,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
    });
  }
  return g.__preptimePool;
}
