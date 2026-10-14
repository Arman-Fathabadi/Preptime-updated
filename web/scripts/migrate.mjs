// Creates Better Auth's tables and the app's user_data table.
// Usage: node --env-file=.env.local scripts/migrate.mjs   (or: DATABASE_URL=... npm run db:migrate)
// NOTE: if you add Better Auth plugins that change the schema (passkey, anonymous, ...),
// add them to the options below too, so their tables get created.
import { readFileSync } from 'node:fs';
import { Pool } from 'pg';
import { getMigrations } from 'better-auth/db/migration';

if (!process.env.DATABASE_URL) {
  console.error('Set DATABASE_URL first.');
  process.exit(1);
}
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const { runMigrations, toBeCreated, toBeAdded } = await getMigrations({ database: pool });
console.log(`Better Auth: ${toBeCreated.length} tables to create, ${toBeAdded.length} to alter.`);
await runMigrations();
await pool.query(readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8'));
await pool.end();
console.log('Done.');
