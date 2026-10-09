import { describe, it, expect, beforeEach } from 'vitest';
import { rateLimit, resetRateLimits, clientIp, enforceRateLimit } from '../../utils/rateLimit';

describe('rateLimit', () => {
  beforeEach(() => resetRateLimits());

  it('allows up to the limit then blocks', () => {
    for (let i = 0; i < 3; i++) expect(rateLimit('k', 3, 60_000, 1000).ok).toBe(true);
    const blocked = rateLimit('k', 3, 60_000, 1000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });

  it('keeps separate budgets per key', () => {
    for (let i = 0; i < 3; i++) rateLimit('a', 3, 60_000, 1000);
    expect(rateLimit('a', 3, 60_000, 1000).ok).toBe(false);
    expect(rateLimit('b', 3, 60_000, 1000).ok).toBe(true);
  });

  it('resets after the window', () => {
    for (let i = 0; i < 4; i++) rateLimit('k', 3, 60_000, 1000);
    expect(rateLimit('k', 3, 60_000, 1000).ok).toBe(false);
    expect(rateLimit('k', 3, 60_000, 1000 + 60_000).ok).toBe(true);
  });

  it('reads the first x-forwarded-for entry, falling back safely', () => {
    expect(clientIp({ headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' } })).toBe('1.2.3.4');
    expect(clientIp({ socket: { remoteAddress: '9.9.9.9' } })).toBe('9.9.9.9');
    expect(clientIp({})).toBe('unknown');
  });

  it('enforceRateLimit sends 429 with Retry-After once over budget', () => {
    const calls: any = { headers: {} as Record<string, string>, code: 0, body: null };
    const res = {
      status(c: number) { calls.code = c; return this; },
      setHeader(k: string, v: string) { calls.headers[k] = v; return this; },
      json(b: any) { calls.body = b; return this; },
    };
    const req = { headers: { 'x-forwarded-for': '7.7.7.7' } };
    expect(enforceRateLimit(req, res, 'r', 2)).toBe(true);
    expect(enforceRateLimit(req, res, 'r', 2)).toBe(true);
    expect(enforceRateLimit(req, res, 'r', 2)).toBe(false);
    expect(calls.code).toBe(429);
    expect(Number(calls.headers['Retry-After'])).toBeGreaterThan(0);
  });
});
