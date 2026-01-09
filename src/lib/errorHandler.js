/**
 * Global Error Handler Utility
 * 
 * Centralized error handling with Sentry integration
 */

import Sentry from './sentry';

/**
 * Log error to console and Sentry
 * @param {Error} error - The error object
 * @param {Object} context - Additional context
 */
export function logError(error, context = {}) {
    // Always log to console
    console.error('Error:', error);
    if (Object.keys(context).length > 0) {
        console.error('Context:', context);
    }

    // Send to Sentry in production
    if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_SENTRY_ENABLED === 'true') {
        Sentry.captureException(error, {
            extra: context,
        });
    }
}

/**
 * Wrap async route handlers with error handling
 * @param {Function} handler - The route handler function
 * @returns {Function} Wrapped handler
 */
export function withErrorHandler(handler) {
    return async (request, context) => {
        try {
            return await handler(request, context);
        } catch (error) {
            logError(error, {
                url: request.url,
                method: request.method,
                route: context?.params,
            });

            // Return generic error response
            return new Response(
                JSON.stringify({
                    success: false,
                    message: 'An unexpected error occurred. Our team has been notified.',
                    errorId: Sentry.lastEventId(),
                }),
                {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }
    };
}

/**
 * Create error response with Sentry tracking
 * @param {Error} error - The error
 * @param {string} userMessage - User-friendly message
 * @param {number} statusCode - HTTP status code
 */
export function createErrorResponse(error, userMessage = 'An error occurred', statusCode = 500) {
    logError(error);

    return {
        success: false,
        message: userMessage,
        errorId: Sentry.lastEventId(),
        ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    };
}
