// Runs once when the Node.js server starts (see src/instrumentation.js).
// Reuses the existing init/scrubbing config in src/lib/sentry.js instead of
// duplicating Sentry.init() options here.
import '@/lib/sentry';
