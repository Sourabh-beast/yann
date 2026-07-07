/**
 * Redis-based Rate Limiter
 * 
 * For production multi-server deployments
 * Falls back to in-memory if Redis unavailable
 */

import Redis from 'ioredis';
import { createRateLimiter } from './rateLimiter';
import logger from './logger';

// In-memory rate limiter, keyed by config name, built lazily from the same
// {maxRequests, windowMs, message} shape used by the Redis limiter configs -
// so the in-memory fallback here shares the request-counting logic in
// rateLimiter.js instead of trying to call a limiter function that was never
// created from this config object.
const memoryLimiterCache = new Map();
function applyMemoryRateLimit(request, config) {
    const cacheKey = config.name || 'default';
    let limiter = memoryLimiterCache.get(cacheKey);
    if (!limiter) {
        limiter = createRateLimiter(config);
        memoryLimiterCache.set(cacheKey, limiter);
    }
    return limiter(request);
}

let redis = null;
let redisAvailable = false;

// Initialize Redis connection
try {
    if (process.env.REDIS_URL) {
        redis = new Redis(process.env.REDIS_URL, {
            maxRetriesPerRequest: 3,
            enableReadyCheck: true,
            lazyConnect: true,
        });

        redis.on('connect', () => {
            redisAvailable = true;
            logger.info('Redis connected for rate limiting/caching');
        });

        redis.on('error', (err) => {
            redisAvailable = false;
            // Loud on purpose: falling back to per-instance in-memory rate
            // limiting silently would mean abuse protection quietly stops
            // working under multi-instance serverless scale.
            logger.error({ err }, 'Redis error, falling back to in-memory rate limiting');
        });

        // Attempt connection
        redis.connect().catch((err) => {
            redisAvailable = false;
            logger.error({ err }, 'Redis unavailable, using in-memory rate limiting');
        });
    } else if (process.env.NODE_ENV === 'production') {
        // Loud on purpose: without REDIS_URL in production, rate limiting is
        // effectively per-instance only and caching never engages.
        logger.error('REDIS_URL is not set in production - rate limiting and caching are running in degraded (in-memory/no-op) mode');
    }
} catch (error) {
    logger.error({ err: error }, 'Redis initialization failed, using in-memory rate limiting');
}

/**
 * Shared accessors so other modules (e.g. the caching layer) can reuse this
 * same Redis connection instead of opening a second one.
 */
export function getRedisClient() {
    return redis;
}

export function isRedisAvailable() {
    return redisAvailable;
}

/**
 * Redis-based rate limiter
 */
export async function applyRedisRateLimit(request, config) {
    // Fallback to in-memory if Redis not available
    if (!redis || !redisAvailable) {
        return applyMemoryRateLimit(request, config);
    }

    const identifier = getIdentifier(request);
    const key = `ratelimit:${config.name || 'default'}:${identifier}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    try {
        // Use Redis sorted set for sliding window
        const multi = redis.multi();

        // Remove old entries
        multi.zremrangebyscore(key, 0, windowStart);

        // Count requests in current window
        multi.zcard(key);

        // Add current request
        multi.zadd(key, now, `${now}-${Math.random()}`);

        // Set expiry
        multi.expire(key, Math.ceil(config.windowMs / 1000));

        const results = await multi.exec();
        const count = results[1][1]; // Get count result

        if (count >= config.maxRequests) {
            const oldestEntry = await redis.zrange(key, 0, 0, 'WITHSCORES');
            const resetTime = oldestEntry.length > 0
                ? parseInt(oldestEntry[1]) + config.windowMs
                : now + config.windowMs;

            const retryAfter = Math.ceil((resetTime - now) / 1000);

            return {
                allowed: false,
                message: config.message || 'Too many requests, please try again later',
                retryAfter,
            };
        }

        return { allowed: true };
    } catch (error) {
        logger.error({ err: error }, 'Redis rate limit error, falling back to in-memory');
        // Fallback to in-memory on error
        return applyMemoryRateLimit(request, config);
    }
}

/**
 * Get identifier from request (IP address)
 */
function getIdentifier(request) {
    // Try to get real IP from headers (for proxies/load balancers)
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
        return realIp;
    }

    // Fallback to a default identifier
    return 'unknown';
}

/**
 * Create rate limiter with Redis support
 */
export function createRedisRateLimiter(config) {
    return {
        ...config,
        name: config.name || 'default',
    };
}

// Export pre-configured limiters
export const redisOtpRateLimiter = createRedisRateLimiter({
    name: 'otp',
    maxRequests: 3,
    windowMs: 15 * 60 * 1000,
    message: 'Too many OTP requests. Please try again in 15 minutes.',
});

export const redisWalletRateLimiter = createRedisRateLimiter({
    name: 'wallet',
    maxRequests: 5,
    windowMs: 60 * 1000,
    message: 'Too many wallet operations. Please wait a moment.',
});

export const redisAuthRateLimiter = createRedisRateLimiter({
    name: 'auth',
    maxRequests: 10,
    windowMs: 15 * 60 * 1000,
    message: 'Too many authentication attempts. Please try again later.',
});

export const redisApiRateLimiter = createRedisRateLimiter({
    name: 'api',
    maxRequests: 100,
    windowMs: 60 * 1000,
    message: 'Too many requests. Please slow down.',
});

export const redisPaymentRateLimiter = createRedisRateLimiter({
    name: 'payment',
    maxRequests: 5,
    windowMs: 60 * 1000,
    message: 'Too many payment attempts. Please wait a moment.',
});

export const redisBookingRateLimiter = createRedisRateLimiter({
    name: 'booking',
    maxRequests: 20,
    windowMs: 60 * 1000,
    message: 'Too many booking requests. Please slow down.',
});

/**
 * Graceful shutdown
 */
export async function closeRedis() {
    if (redis) {
        await redis.quit();
    }
}
