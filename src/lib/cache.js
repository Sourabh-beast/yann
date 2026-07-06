/**
 * Redis-backed read cache.
 *
 * This is a pure performance backstop, not a source of truth: any error or
 * unavailability falls through to the underlying fetch so a Redis outage
 * degrades latency, never correctness. (Deliberately asymmetric with the
 * rate limiter, which fails loud on missing production config - a cache
 * miss should never fail a request.)
 */
import { getRedisClient, isRedisAvailable } from './redisRateLimiter';
import logger from './logger';

export async function getOrSetCache(key, ttlSeconds, fetchFn) {
    const redis = getRedisClient();

    if (redis && isRedisAvailable()) {
        try {
            const cached = await redis.get(key);
            if (cached) {
                return JSON.parse(cached);
            }
        } catch (error) {
            logger.error({ err: error, key }, 'Cache read error, falling back to source');
        }
    }

    const fresh = await fetchFn();

    // Never cache a null/undefined result (e.g. "nothing found yet") - that's
    // more likely a transient/empty state than something worth serving stale
    // for the full TTL.
    if (fresh !== null && fresh !== undefined && redis && isRedisAvailable()) {
        try {
            await redis.set(key, JSON.stringify(fresh), 'EX', ttlSeconds);
        } catch (error) {
            logger.error({ err: error, key }, 'Cache write error');
        }
    }

    return fresh;
}

/**
 * Invalidate a single cache key (best-effort - errors are logged, not thrown).
 */
export async function invalidateCache(key) {
    const redis = getRedisClient();
    if (!redis || !isRedisAvailable()) return;

    try {
        await redis.del(key);
    } catch (error) {
        logger.error({ err: error, key }, 'Cache invalidation error');
    }
}
