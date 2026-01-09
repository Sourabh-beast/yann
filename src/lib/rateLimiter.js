/**
 * Rate Limiting Middleware
 * 
 * Protects critical endpoints from abuse, DDoS, and brute force attacks
 * Uses in-memory storage for simplicity - consider Redis for production scale
 */

const rateLimitStore = new Map();

// Clean up old entries every 10 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
        if (now > value.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}, 10 * 60 * 1000);

/**
 * Create a rate limiter with specified limits
 * @param {Object} options - Rate limit configuration
 * @param {number} options.maxRequests - Maximum requests allowed in the window
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {string} options.message - Error message to return when limit exceeded
 * @returns {Function} Middleware function
 */
export function createRateLimiter({ maxRequests = 5, windowMs = 15 * 60 * 1000, message = 'Too many requests' }) {
    return function rateLimitMiddleware(request) {
        // Get client identifier (IP address)
        const ipHeader = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';
        const clientIp = ipHeader.split(',')[0].trim();

        // Create unique key for this endpoint and client
        const endpoint = new URL(request.url).pathname;
        const key = `${endpoint}:${clientIp}`;

        const now = Date.now();
        const record = rateLimitStore.get(key);

        if (!record) {
            // First request from this client
            rateLimitStore.set(key, {
                count: 1,
                resetTime: now + windowMs,
                firstRequestTime: now
            });
            return { allowed: true };
        }

        // Check if window has expired
        if (now > record.resetTime) {
            // Reset the window
            rateLimitStore.set(key, {
                count: 1,
                resetTime: now + windowMs,
                firstRequestTime: now
            });
            return { allowed: true };
        }

        // Increment request count
        record.count++;

        // Check if limit exceeded
        if (record.count > maxRequests) {
            const retryAfter = Math.ceil((record.resetTime - now) / 1000);
            return {
                allowed: false,
                retryAfter,
                message: `${message}. Please try again in ${retryAfter} seconds.`
            };
        }

        return { allowed: true, remaining: maxRequests - record.count };
    };
}

/**
 * Preset rate limiters for common use cases
 */

// Strict rate limit for OTP endpoints (3 requests per 15 minutes)
export const otpRateLimiter = createRateLimiter({
    maxRequests: 3,
    windowMs: 15 * 60 * 1000,
    message: 'Too many OTP requests'
});

// Moderate rate limit for authentication endpoints (10 requests per 15 minutes)
export const authRateLimiter = createRateLimiter({
    maxRequests: 10,
    windowMs: 15 * 60 * 1000,
    message: 'Too many authentication attempts'
});

// Lenient rate limit for general API endpoints (100 requests per minute)
export const apiRateLimiter = createRateLimiter({
    maxRequests: 100,
    windowMs: 60 * 1000,
    message: 'Too many requests'
});

// Very strict for wallet operations (5 requests per minute)
export const walletRateLimiter = createRateLimiter({
    maxRequests: 5,
    windowMs: 60 * 1000,
    message: 'Too many wallet operations'
});

/**
 * Helper to apply rate limiting in route handlers
 * Usage:
 * 
 * import { applyRateLimit, otpRateLimiter } from '@/lib/rateLimiter';
 * 
 * export async function POST(request) {
 *   const rateLimitResult = applyRateLimit(request, otpRateLimiter);
 *   if (!rateLimitResult.allowed) {
 *     return NextResponse.json(
 *       { success: false, message: rateLimitResult.message },
 *       { 
 *         status: 429,
 *         headers: { 'Retry-After': rateLimitResult.retryAfter.toString() }
 *       }
 *     );
 *   }
 *   // ... rest of handler
 * }
 */
export function applyRateLimit(request, rateLimiter) {
    return rateLimiter(request);
}
