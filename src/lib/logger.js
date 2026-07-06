/**
 * Structured logging baseline (Pino).
 *
 * Level is driven by NODE_ENV: verbose in development, quieter in production.
 * Scope for this pass: used in the files already touched by the scaling
 * work (see SCALING.md) - the remaining console.* call sites across the
 * codebase are a separate fast-follow, not swept in this pass.
 */
import pino from 'pino';

const logger = pino({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
});

export default logger;
