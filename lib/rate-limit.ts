// Lightweight in-memory fixed-window rate limiter.
// Good enough as a first layer for a single-instance deploy / local dev.
// (For multi-instance serverless, swap the Map for Upstash Redis later.)

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

export function rateLimit(
  key: string,
  limit = 5,
  windowMs = 60_000
): { allowed: boolean; remaining: number; retryAfter: number } {
  const now = Date.now();

  // Opportunistic cleanup so the map doesn't grow unbounded.
  if (store.size > 5000) {
    for (const [k, v] of store) if (now > v.resetAt) store.delete(k);
  }

  const entry = store.get(key);
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfter: 0 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count, retryAfter: 0 };
}

export function resetRateLimit(key: string) {
  store.delete(key);
}
