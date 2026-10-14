-- Run once against your Postgres (Neon SQL editor works). Safe to re-run.
-- Better Auth's own tables are created by `npm run db:migrate`; this file only holds app data.
CREATE TABLE IF NOT EXISTS user_data (
  user_id    text PRIMARY KEY,
  doc        jsonb NOT NULL,
  version    integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);
