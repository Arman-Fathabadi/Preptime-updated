import { describe, it, expect, vi, beforeEach } from 'vitest';

const getSession = vi.fn();
const listUserAccounts = vi.fn();
const getAccessToken = vi.fn();

vi.mock('../../lib/auth', () => ({
  authEnabled: true,
  auth: { api: { getSession: (...a: unknown[]) => getSession(...a), listUserAccounts: (...a: unknown[]) => listUserAccounts(...a), getAccessToken: (...a: unknown[]) => getAccessToken(...a) } },
}));

const SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';
const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

function call(query: Record<string, unknown>, method = 'GET', uid = 'u1') {
  getSession.mockResolvedValue(uid ? { user: { id: uid } } : null);
  const res: any = { statusCode: 0, body: null, headers: {} as Record<string, string> };
  res.status = (c: number) => ((res.statusCode = c), res);
  res.json = (b: unknown) => ((res.body = b), res);
  res.setHeader = (k: string, v: string) => ((res.headers[k] = v), res);
  return import('../../pages/api/calendar/events').then(async ({ default: handler }) => {
    await handler({ method, query, headers: {} } as any, res);
    return res;
  });
}

const ok = { from: '2026-10-05', to: '2026-12-06' };
const googleResponse = (items: unknown[], status = 200) => ({ ok: status < 300, status, json: async () => ({ items }) });

beforeEach(() => {
  vi.clearAllMocks();
  listUserAccounts.mockResolvedValue([{ id: 'acc1', providerId: 'google', scopes: ['openid', SCOPE] }]);
  getAccessToken.mockResolvedValue({ accessToken: 'tok' });
});

describe('/api/calendar/events', () => {
  it('rejects other methods and signed-out callers', async () => {
    expect((await call(ok, 'POST')).statusCode).toBe(405);
    expect((await call(ok, 'GET', '')).statusCode).toBe(401);
  });

  it('validates the date range', async () => {
    expect((await call({ from: 'x', to: ok.to })).statusCode).toBe(400);
    expect((await call({ from: '2026-12-06', to: '2026-10-05' })).statusCode).toBe(400);
    expect((await call({ from: '2024-01-01', to: '2026-12-06' })).statusCode).toBe(400);
  });

  it('says not_connected when there is no Google account with the Calendar permission', async () => {
    listUserAccounts.mockResolvedValue([{ id: 'a', providerId: 'github', scopes: [] }]);
    expect((await call(ok)).body).toEqual({ error: 'not_connected' });
    listUserAccounts.mockResolvedValue([{ id: 'a', providerId: 'google', scopes: ['openid', 'email'] }]);
    const res = await call(ok);
    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({ error: 'not_connected' });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('asks to reconnect when Google refuses the token', async () => {
    mockFetch.mockResolvedValue(googleResponse([], 403));
    const res = await call(ok);
    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({ error: 'reconnect' });
  });

  it('returns trimmed events and drops cancelled and declined ones', async () => {
    mockFetch.mockResolvedValue(
      googleResponse([
        { id: 'a', summary: 'Lecture', start: { dateTime: '2026-10-12T09:00:00-04:00' }, end: { dateTime: '2026-10-12T10:30:00-04:00' } },
        { id: 'b', summary: 'Holiday', start: { date: '2026-10-13' }, end: { date: '2026-10-14' } },
        { id: 'c', status: 'cancelled', summary: 'Gone', start: { dateTime: '2026-10-12T11:00:00-04:00' }, end: { dateTime: '2026-10-12T12:00:00-04:00' } },
        { id: 'd', summary: 'Declined', start: { dateTime: '2026-10-12T13:00:00-04:00' }, end: { dateTime: '2026-10-12T14:00:00-04:00' }, attendees: [{ self: true, responseStatus: 'declined' }] },
        { id: 'e', start: { dateTime: '2026-10-12T15:00:00-04:00' }, end: { dateTime: '2026-10-12T16:00:00-04:00' } },
      ])
    );
    const res = await call(ok);
    expect(res.statusCode).toBe(200);
    expect(res.body.events).toEqual([
      { id: 'a', title: 'Lecture', start: '2026-10-12T09:00:00-04:00', end: '2026-10-12T10:30:00-04:00', allDay: false },
      { id: 'b', title: 'Holiday', start: '2026-10-13', end: '2026-10-14', allDay: true },
      { id: 'e', title: '', start: '2026-10-12T15:00:00-04:00', end: '2026-10-12T16:00:00-04:00', allDay: false },
    ]);
    const [url, init] = mockFetch.mock.calls[0];
    expect(String(url)).toContain('calendars/primary/events');
    expect(String(url)).toContain('singleEvents=true');
    expect((init as any).headers.Authorization).toBe('Bearer tok');
  });
});
