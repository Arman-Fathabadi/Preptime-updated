import type { NextApiRequest, NextApiResponse } from 'next';
import { fromNodeHeaders } from 'better-auth/node';
import { auth, authEnabled } from '../../../lib/auth';
import { rateLimit } from '../../../utils/rateLimit';
import { GCAL_SCOPE } from '../../../lib/gcal';

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const MAX_SPAN_DAYS = 400;

type GoogleEvent = {
  id?: string;
  status?: string;
  summary?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  attendees?: { self?: boolean; responseStatus?: string }[];
};

/**
 * Read-only: lists the signed-in person's primary Google Calendar events between two dates.
 * The Google access token never reaches the browser; Better Auth keeps it (and refreshes it) on the server.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (!authEnabled) return res.status(503).json({ error: 'not_configured' });
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) return res.status(401).json({ error: 'Sign in first.' });
  const limited = rateLimit(`gcal:${session.user.id}`, 20, 60_000);
  if (!limited.ok) {
    res.setHeader('Retry-After', String(limited.retryAfterSec));
    return res.status(429).json({ error: 'Too many requests. Try again in a minute.' });
  }

  const { from, to } = req.query;
  if (typeof from !== 'string' || typeof to !== 'string' || !ISO_DAY.test(from) || !ISO_DAY.test(to)) {
    return res.status(400).json({ error: 'Expected ?from=YYYY-MM-DD&to=YYYY-MM-DD.' });
  }
  const span = (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000;
  if (!(span >= 0 && span <= MAX_SPAN_DAYS)) return res.status(400).json({ error: `Date range must be 0 to ${MAX_SPAN_DAYS} days.` });

  let accessToken: string;
  try {
    const headers = fromNodeHeaders(req.headers);
    const accounts = await auth.api.listUserAccounts({ headers });
    const google = accounts.find((a) => a.providerId === 'google' && a.scopes?.includes(GCAL_SCOPE));
    if (!google) return res.status(409).json({ error: 'not_connected' });
    const t = await auth.api.getAccessToken({ body: { accountId: google.id }, headers });
    accessToken = t.accessToken;
  } catch {
    // No Google account linked, or it has no usable token yet.
    return res.status(409).json({ error: 'not_connected' });
  }

  // Pad a day each side: the browser converts to its own time zone and may pull an event into the range.
  const timeMin = new Date(Date.parse(`${from}T00:00:00Z`) - 86_400_000).toISOString();
  const timeMax = new Date(Date.parse(`${to}T00:00:00Z`) + 2 * 86_400_000).toISOString();
  const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
  url.search = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '2500',
    fields: 'items(id,status,summary,start,end,attendees(self,responseStatus))',
  }).toString();

  try {
    const g = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (g.status === 401 || g.status === 403) return res.status(409).json({ error: 'reconnect' }); // revoked, or the Calendar permission was not granted
    if (!g.ok) return res.status(502).json({ error: 'Google Calendar did not answer. Try again shortly.' });
    const body = (await g.json()) as { items?: GoogleEvent[] };

    const events = (body.items ?? [])
      .filter((e) => e.id && e.status !== 'cancelled' && !e.attendees?.some((a) => a.self && a.responseStatus === 'declined'))
      .map((e) => ({
        id: String(e.id),
        title: e.summary || '',
        start: e.start?.dateTime ?? e.start?.date ?? '',
        end: e.end?.dateTime ?? e.end?.date ?? '',
        allDay: !e.start?.dateTime,
      }))
      .filter((e) => e.start && e.end);
    return res.status(200).json({ events });
  } catch (e) {
    console.error('calendar fetch failed', e);
    return res.status(502).json({ error: 'Could not reach Google Calendar.' });
  }
}
