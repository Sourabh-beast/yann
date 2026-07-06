import * as Sentry from '@sentry/nextjs';

// Next.js instrumentation hook - runs once per runtime at server startup.
// Without this file, sentry.js's Sentry.init() was never actually invoked
// anywhere in the request path, so no errors were ever being reported.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config.js');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config.js');
  }
}

export const onRequestError = Sentry.captureRequestError;
