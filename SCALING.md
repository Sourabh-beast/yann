# Scaling Notes

Backend: Next.js 15 App Router deployed as serverless functions (Vercel), MongoDB/Mongoose, Redis (ioredis) for rate limiting and caching. This doc covers what the current optimization pass fixed, what still bottlenecks at 30K concurrent users, and what's needed beyond that.

## What this pass fixed

- Consolidated the DB connector (`src/lib/connectDB.js`) onto the serverless-safe caching pattern (`global.mongoose`), fixing a cold-start race and adding pool/timeout config. Deleted the unused duplicate `src/lib/mongodb.js`.
- Fixed N+1 query patterns in `admin/withdrawals`, `wallet/refund`, `admin/notifications` (broadcast sends), `cron/expire-payments`.
- Added `.lean()` + pagination caps (or aggregation, where a cap would have silently produced wrong numbers) across provider/resident/reviews/admin routes.
- Added missing indexes on `CallRequest` and `Report`.
- Built a Redis-backed read cache (`src/lib/cache.js`), wired into `/api/services` and `/api/admin/stats`.
- Hardened rate limiting: 8 high-risk routes (OTP, login, register, wallet, payment, booking creation) now use the Redis-backed limiter instead of per-instance in-memory (which doesn't work across multiple serverless instances).
- Deferred non-critical push-notification sends past the response via `after()` in `notificationHelper.js`.
- Added Zod validation to `call-requests` and `reviews`.
- Added a Pino logging baseline to the core shared modules touched in this pass.
- Added security headers for API routes; extended `/api/health` with informational Redis/memory checks.

## Known gaps and judgment calls from this pass

- **Redis in production is unconfirmed.** The rate limiter and cache both degrade gracefully (in-memory fallback / cache miss) rather than crashing requests, but that means today's abuse protection and cache hit rate could both be silently near-zero if `REDIS_URL` isn't actually set in Vercel's production environment. **Verify this first** — it's the single highest-leverage infra check before assuming any of Phase 3/4's benefit is real in production.
- **CORS substring-matching bug was found but not fixed** (`src/middleware.js`'s `isAllowedOrigin()` accepts anything containing `"localhost"` or starting with an allowed origin) — deferred at your request pending a review of real production origins.
- **`providers/search` is not cached.** Correctly caching it while preserving per-user blocked-list filtering and correct pagination boundaries (blocked-user exclusion is baked into the DB query today) needs a real rewrite; too much correctness risk to do quickly with no test suite to catch a subtle pagination bug.
- **Sentry is not actually wired up.** `@sentry/nextjs` is a dependency and `src/lib/errorHandler.js`/`sentry.js` reference it, but nothing in the 131 routes imports that chain, and there's no `instrumentation.js` — so `Sentry.init()` never runs. Worth fixing (or removing the dependency) independent of this pass.
- **Full logging/validation/rate-limiting sweeps are partial by design.** This pass touched the highest-traffic/highest-risk files; the remaining ~100+ routes still use raw `console.*`, lack Zod schemas, and aren't rate limited. Same patterns, just not yet applied everywhere.
- **Provider lifetime-earnings and review-average calculations** were moved to aggregations instead of being capped, to avoid a financial-correctness bug — but they still scan the full completed-bookings/reviews collection per request. Fine at current scale; revisit if a single provider's history grows very large (see below).

## Bottlenecks that will remain at 30K even after this pass

- **MongoDB Atlas connection ceiling.** `maxPoolSize: 5` in `connectDB.js` is a calculation, not a load-tested number: at ~300 concurrent Vercel function instances that's ~1,500 connections, right at an Atlas M10's ceiling. Measure actual concurrent-instance count via Vercel's dashboard under real traffic and recompute.
- **Single-region, single Redis instance.** No read replicas, no cache warming — cold cache after every Redis restart/deploy.
- **`after()` has no delivery guarantee.** Fine for push notifications today (already best-effort), wrong tool if you ever add something that must not silently fail (e.g. a legally-required payment confirmation email).
- **CDN caching barely helps authenticated traffic.** `middleware.js` sets `Vary: Authorization, Cookie` on cacheable routes, so most of this app's (mostly authenticated) traffic gets a unique CDN cache entry per user. The Redis-layer cache added in this pass is what actually helps that traffic.
- **Pagination caps, not true pagination**, on `provider/bookings`, `provider/requests`, `resident/requests` — bounds the worst case without a response-shape change, but doesn't solve unbounded growth long-term.
- **Provider earnings/review-average aggregations** scan full history per request — fine now, but a candidate for incrementally-maintained stats (increment on booking completion) if any provider's history grows into the tens of thousands of records.

## What's needed to go from 30K to 100K

- **Atlas tier upgrade** (M10 → M20/M30) for both connection ceiling and IOPS/throughput. Recompute the "instances × pool size" math at the new target.
- **Atlas read replicas** for admin/reporting aggregations so they don't compete with primary-path booking/payment writes.
- **Sharding** — only once a single collection (likely `bookings` or `transactions`) outgrows a single replica set; evaluate, don't pre-emptively implement.
- **Managed Redis HA/cluster tier** (Upstash or similar) once cache/rate-limit traffic itself becomes a bottleneck; consider separate Redis databases for caching vs. rate limiting to isolate blast radius.
- **A durable queue** (e.g. Upstash QStash) once any background job needs guaranteed delivery — revisit the "skip QStash" decision from this pass at that point.
- **Vercel plan tier** — concurrency and function-duration limits scale with plan; recompute Atlas connection math against the actual concurrency ceiling at each tier.
- **Complete the partial sweeps**: full pagination (with mobile-app coordination on response shape), full logging conversion, full Zod validation coverage, full rate-limit coverage across all 131 routes.
