// In-memory sliding-window rate limiter. Good enough for a single-instance,
// self-hosted deployment (this app's target — see docker-compose.yml); a
// multi-instance deployment would need a shared store (e.g. Redis) instead.
const hits = new Map<string, number[]>();

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  const timestamps = (hits.get(key) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= limit) {
    hits.set(key, timestamps);
    return true;
  }

  timestamps.push(now);
  hits.set(key, timestamps);
  return false;
}
