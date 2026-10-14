import type { NextApiRequest, NextApiResponse } from 'next';
import { toNodeHandler } from 'better-auth/node';
import { auth, authEnabled } from '../../../lib/auth';

// Better Auth reads the raw body itself.
export const config = { api: { bodyParser: false } };

const handler = authEnabled ? toNodeHandler(auth) : null;

export default function route(req: NextApiRequest, res: NextApiResponse) {
  if (!handler) return res.status(503).json({ error: 'Accounts are not set up on this deployment.' });
  return handler(req, res);
}
