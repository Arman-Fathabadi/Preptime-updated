import type { NextApiRequest, NextApiResponse } from 'next';
import { fromNodeHeaders } from 'better-auth/node';
import { auth, authEnabled } from '../../lib/auth';
import { getPool } from '../../lib/db';
import { parseBackup, DEFAULT_PREFS } from '../../lib/prep';

export const config = { api: { bodyParser: { sizeLimit: '2mb' } } };

const MAX_TASKS = 5000;

/**
 * One document per signed-in user: { items, prefs } plus a version counter.
 * PUT must name the version it was based on, so two devices can never silently overwrite each other.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (!authEnabled) return res.status(503).json({ error: 'Accounts are not set up on this deployment.' });
  if (req.method !== 'GET' && req.method !== 'PUT') {
    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) return res.status(401).json({ error: 'Sign in to sync.' });
  const userId = session.user.id;
  const pool = getPool();

  try {
    if (req.method === 'GET') {
      const { rows } = await pool.query('SELECT doc, version, updated_at FROM user_data WHERE user_id = $1', [userId]);
      if (!rows[0]) return res.status(200).json({ version: 0, doc: null });
      return res.status(200).json({ version: rows[0].version, doc: rows[0].doc, updatedAt: rows[0].updated_at });
    }

    const { baseVersion, doc } = req.body ?? {};
    if (!Number.isInteger(baseVersion) || baseVersion < 0 || !doc || !Array.isArray(doc.items)) {
      return res.status(400).json({ error: 'Expected { baseVersion, doc: { items, prefs } }.' });
    }
    if (doc.items.length > MAX_TASKS) return res.status(413).json({ error: `Too many tasks (max ${MAX_TASKS}).` });

    // Re-validate through the same parser as backup import so bad data never gets stored.
    const clean = parseBackup(JSON.stringify({ tasks: doc.items, prefs: doc.prefs }));
    const prefs = { ...DEFAULT_PREFS, ...(clean.prefs ?? {}) };
    const stored = { items: clean.tasks, prefs };

    // Atomic compare-and-set: inserts when baseVersion is 0, updates only if the version still matches.
    const { rows } = await pool.query(
      `INSERT INTO user_data (user_id, doc, version) VALUES ($1, $2, 1)
       ON CONFLICT (user_id) DO UPDATE
         SET doc = EXCLUDED.doc, version = user_data.version + 1, updated_at = now()
         WHERE user_data.version = $3
       RETURNING version, updated_at`,
      [userId, JSON.stringify(stored), baseVersion]
    );
    if (!rows[0]) {
      const cur = await pool.query('SELECT doc, version FROM user_data WHERE user_id = $1', [userId]);
      return res.status(409).json({ error: 'Changed on another device.', version: cur.rows[0]?.version ?? 0, doc: cur.rows[0]?.doc ?? null });
    }
    return res.status(200).json({ version: rows[0].version, updatedAt: rows[0].updated_at });
  } catch (e) {
    console.error('sync failed', e);
    return res.status(500).json({ error: 'Sync failed. Your data is still safe in this browser.' });
  }
}
