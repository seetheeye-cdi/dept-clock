// Simple in-memory rate limiter for Edge runtime fallback (best effort).
// For production, prefer Vercel Edge Config / Upstash Redis.

type Bucket = { tokens: number; lastRefill: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, maxPerMinute: number): boolean {
  const now = Date.now();
  const refillMs = 60_000;
  const bucket = buckets.get(key) ?? { tokens: maxPerMinute, lastRefill: now };
  // Refill
  if (now - bucket.lastRefill >= refillMs) {
    bucket.tokens = maxPerMinute;
    bucket.lastRefill = now;
  }
  if (bucket.tokens <= 0) {
    buckets.set(key, bucket);
    return false;
  }
  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return true;
}


