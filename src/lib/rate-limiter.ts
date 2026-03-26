/**
 * Simple in-memory sliding-window rate limiter.
 *
 * Good for single-instance deployments (Vercel serverless, Railway, etc.).
 * For multi-instance / edge deployments, swap this out for Upstash Redis
 * rate limiting (@upstash/ratelimit) which shares state across instances.
 *
 * Usage:
 *   const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 5 });
 *
 *   // In your route handler:
 *   const { success, remaining, retryAfterMs } = limiter.check(ip);
 *   if (!success) return new Response("Too many requests", { status: 429 });
 */

interface RateLimiterOptions {
  /** Time window in milliseconds */
  windowMs: number;
  /** Max requests allowed per window */
  maxRequests: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  retryAfterMs: number;
}

interface TokenBucket {
  timestamps: number[];
}

export function createRateLimiter({ windowMs, maxRequests }: RateLimiterOptions) {
  const buckets = new Map<string, TokenBucket>();

  // Periodically purge stale entries to prevent memory leaks (every 60s)
  const CLEANUP_INTERVAL = 60_000;
  let lastCleanup = Date.now();

  function cleanup(now: number) {
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;

    for (const [key, bucket] of buckets) {
      // Remove the entire bucket if all timestamps are expired
      const fresh = bucket.timestamps.filter((ts) => now - ts < windowMs);
      if (fresh.length === 0) {
        buckets.delete(key);
      } else {
        bucket.timestamps = fresh;
      }
    }
  }

  function check(key: string): RateLimitResult {
    const now = Date.now();
    cleanup(now);

    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { timestamps: [] };
      buckets.set(key, bucket);
    }

    // Drop timestamps outside the current window
    bucket.timestamps = bucket.timestamps.filter((ts) => now - ts < windowMs);

    if (bucket.timestamps.length >= maxRequests) {
      // Oldest timestamp still in window — tell caller when it expires
      const oldestInWindow = bucket.timestamps[0];
      const retryAfterMs = windowMs - (now - oldestInWindow);

      return {
        success: false,
        remaining: 0,
        retryAfterMs: Math.max(retryAfterMs, 0),
      };
    }

    bucket.timestamps.push(now);

    return {
      success: true,
      remaining: maxRequests - bucket.timestamps.length,
      retryAfterMs: 0,
    };
  }

  return { check };
}