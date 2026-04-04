/**
 * Simple in-memory rate limiter for Deno backend functions.
 * Tracks request counts per user email per function per time window.
 * NOTE: This is per-instance memory — effective for single-instance abuse prevention.
 */

const store = new Map(); // key -> { count, windowStart }

/**
 * Check if a user is within the allowed rate limit.
 * @param {string} key - unique key, e.g. "fetchCardComps:user@email.com"
 * @param {number} maxRequests - max allowed requests per window
 * @param {number} windowMs - time window in milliseconds
 * @returns {{ allowed: boolean, retryAfterSec: number }}
 */
export function checkRateLimit(key, maxRequests, windowMs) {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    store.set(key, { count: 1, windowStart: now });
    return { allowed: true, retryAfterSec: 0 };
  }

  if (entry.count >= maxRequests) {
    const retryAfterSec = Math.ceil((windowMs - (now - entry.windowStart)) / 1000);
    return { allowed: false, retryAfterSec };
  }

  entry.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}