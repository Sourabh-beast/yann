/**
 * Sentry Error Monitoring Configuration
 * 
 * Captures and reports errors in production for debugging
 * Sign up at https://sentry.io for free tier
 */

import * as Sentry from '@sentry/nextjs';

// Only initialize Sentry in production or if explicitly enabled
const isProduction = process.env.NODE_ENV === 'production';
const sentryEnabled = process.env.NEXT_PUBLIC_SENTRY_ENABLED === 'true';

if (isProduction || sentryEnabled) {
    Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

        // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
        // We recommend adjusting this value in production
        tracesSampleRate: isProduction ? 0.1 : 1.0,

        // Capture 100% of errors
        sampleRate: 1.0,

        // Set environment
        environment: process.env.NODE_ENV || 'development',

        // Enable debug mode in development
        debug: !isProduction,

        // Ignore common errors
        ignoreErrors: [
            // Browser extensions
            'top.GLOBALS',
            // Random plugins/extensions
            'originalCreateNotification',
            'canvas.contentDocument',
            'MyApp_RemoveAllHighlights',
            // Network errors
            'NetworkError',
            'Network request failed',
        ],

        // Filter sensitive data
        beforeSend(event, hint) {
            // Remove sensitive data from error context
            if (event.request) {
                delete event.request.cookies;
                delete event.request.headers?.authorization;
            }

            // Filter out JWT tokens from error messages
            if (event.message) {
                event.message = event.message.replace(/Bearer\s+[\w-]+\.[\w-]+\.[\w-]+/g, 'Bearer [REDACTED]');
            }

            return event;
        },
    });
}

export default Sentry;
