/**
 * Small in-memory rate limiter for the API proxy routes.
 *
 * These routes forward to the private ML service with the server-side HF_TOKEN, so
 * without a limit anyone who finds the URL could burn the backend. State lives in
 * the serverless instance's memory: it is per instance and resets on a cold start,
 * so treat it as a speed bump, not a hard guarantee. For a hard limit add Vercel
 * WAF rate limiting or a shared store (e.g. Upstash Redis).
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const SWEEP_AT = 5000;

export type RateLimitResult = { ok: boolean; retryAfterSec: number };

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now()
): RateLimitResult {
  const entry = buckets.get(key);

  if (!entry || now >= entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > SWEEP_AT) {
      for (const [k, v] of buckets) if (now >= v.resetAt) buckets.delete(k);
    }
    return { ok: true, retryAfterSec: 0 };
  }

  entry.count += 1;
  if (entry.count > limit) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) };
  }
  return { ok: true, retryAfterSec: 0 };
}

/** Test hook. */
export function resetRateLimits(): void {
  buckets.clear();
}

/** Client IP. On Vercel the platform sets x-forwarded-for, so its first entry is the client. */
export function clientIp(req: {
  headers?: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
}): string {
  const fwd = req.headers?.['x-forwarded-for'];
  const first = (Array.isArray(fwd) ? fwd[0] : fwd)?.split(',')[0]?.trim();
  return first || req.socket?.remoteAddress || 'unknown';
}

/**
 * Apply a per-IP limit to an API handler. Returns true when the request may proceed;
 * otherwise it has already sent the 429 response.
 */
export function enforceRateLimit(
  req: Parameters<typeof clientIp>[0],
  res: { status: (c: number) => any; setHeader?: (k: string, v: string) => any; json: (b: any) => any },
  route: string,
  limit: number,
  windowMs = 60_000
): boolean {
  const result = rateLimit(`${route}:${clientIp(req)}`, limit, windowMs);
  if (result.ok) return true;
  res.setHeader?.('Retry-After', String(result.retryAfterSec));
  res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });
  return false;
}
