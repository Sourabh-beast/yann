/**
 * Redis-based Rate Limiter
 * 
 * For production multi-server deployments
 * Falls back to in-memory if Redis unavailable
 */

import Redis from 'ioredis';
import { applyRateLimit as applyMemoryRateLimit, createRateLimiter } from './rateLimiter';

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
            console.log('✅ Redis connected for rate limiting');
        });

        redis.on('error', (err) => {
            redisAvailable = false;
            console.warn('⚠️ Redis error, falling back to in-memory rate limiting:', err.message);
        });

        // Attempt connection
        redis.connect().catch(() => {
            redisAvailable = false;
            console.warn('⚠️ Redis unavailable, using in-memory rate limiting');
        });
    }
} catch (error) {
    console.warn('⚠️ Redis initialization failed, using in-memory rate limiting');
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
        console.error('Redis rate limit error:', error);
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

/**
 * Graceful shutdown
 */
export async function closeRedis() {
    if (redis) {
        await redis.quit();
    }
}
