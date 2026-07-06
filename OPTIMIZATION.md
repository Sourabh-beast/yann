# Backend Optimization Backlog

This tracks further backend optimizations beyond the initial scaling pass (see `SCALING.md` for what that pass covered) and beyond the quick wins already landed (duplicate index fix, Sentry initialization, `maxTimeMS` on aggregations). Each item below is scoped so it can be picked up independently without breaking existing behavior — that's the point of writing them down rather than doing them all at once.

## Same pattern as before, just more files

### 1. Finish the `.lean()` / `.select()` / pagination-cap sweep
~110 of 131 route files still fetch full Mongoose documents with no field selection or result cap. The pattern is already established (see `provider/bookings/route.js`, `provider/requests/route.js` from the last pass) — for each file:
- Add `.lean()` **only if** nothing in that file calls `.save()`, `.toObject()`, a schema virtual, or a schema method on the fetched document.
- Add `.select()` for the fields actually used in the response mapping.
- Add `.limit()` if the query returns a list with no existing cap — but check first whether the result feeds a sum/average calculation (like the provider earnings and review-rating cases from the last pass); if so, use an aggregation instead of a cap so the numbers stay correct.

### 2. Extend rate limiting to the rest of the routes
Only 8 of 131 routes call `applyRedisRateLimit` today (OTP send/verify, login, register, wallet topup + verify, payment create-order, booking request creation). The presets already exist in `src/lib/redisRateLimiter.js` (`redisApiRateLimiter`, `redisBookingRateLimiter`, `redisWalletRateLimiter`, etc.) — extending coverage is mostly picking the right preset per route family:
- Search/list endpoints (`providers/search`, `services`): looser limits, higher `maxRequests`.
- Write endpoints (booking actions, provider profile updates, reviews): moderate limits.
- Admin routes: can likely skip rate limiting entirely if they're already behind admin auth, or use a generous limit just as a safety net.

### 3. Extend Zod validation to more write endpoints
`src/lib/validation.js` has the schemas and `validateInput()` helper already. Prioritize by write volume, not alphabetically — likely next: `bookings/accept`, `bookings/reject`, `provider/profile` update routes. Skip `register` (see `SCALING.md` — already has complex hand-rolled business-rule validation that a generic schema would risk conflicting with).

### 4. Finish the console → Pino conversion
`src/lib/logger.js` exists. Only the core shared modules (`connectDB.js`, `redisRateLimiter.js`, `cache.js`, `notificationHelper.js`) were converted so far. ~700 remaining `console.*` call sites across route files are a mechanical (if large) find-and-replace, file by file.

## Needs more care — do these deliberately, not as a batch

### 5. Cache the "who is this user" auth-resolution lookup
Nearly every authenticated route re-fetches the full provider/homeowner document by ID just to resolve identity (see `getAuthenticatedProvider()` in `provider/bookings/route.js` as one example of the pattern repeated across many files). A short-TTL (30-60s) Redis cache here, keyed by user ID, would cut a lot of redundant reads on the highest-frequency query in the app.

**Why this needs care, not a quick add:** it requires cache invalidation on every route that updates a provider/homeowner profile (`provider/profile`, `homeowner/profile`, `provider/add-service`, etc.), or a stale profile could be served for up to the TTL window after an edit. Do this as its own change with an explicit list of "routes that must call `invalidateCache()` on write," verified against that list, not just the read side.

### 6. Cache `providers/search`
Flagged and explicitly skipped in the last pass. The blocking issue: blocked-user exclusion (`$nin: blockedProviderIds`) is baked directly into the paginated DB query today, so naively caching the query result would either leak blocked providers to users who cache-hit a version computed for someone else, or break `skip`/`limit` boundaries if blocked users are filtered out after the fact.

**Safe approach:** cache the broader "active providers matching filters" result (without the blocked-user exclusion) keyed by the filter/sort/page params, then apply the per-user blocked-list filter in application code after reading from cache — but that means over-fetching a bit per page to keep the page size correct after filtering. Needs a small correctness test (a user with several blocked providers, checking page boundaries) before shipping, since there's no automated test suite to catch a regression here.

### 7. Idempotency keys on payment-critical endpoints
`payment/create-order`, `wallet/topup`, `wallet/topup/verify` have no protection against a client retry (network blip, double-tap) creating two Razorpay orders or two wallet top-ups for what the user intended as one action. Not something currently broken, but a real risk as retry volume grows with traffic.

**Approach:** accept an idempotency key from the client (or derive one from booking ID + amount + a short time window), store it in Redis with a short TTL, and short-circuit a duplicate request within that window by returning the original result instead of creating a new order. Needs mobile-app coordination if the key should come from the client rather than being derived server-side.

### 8. Move base64 image uploads out of the JSON request body
`register` (driver license images) and profile-photo update routes currently accept base64-encoded images inline in the JSON body. This inflates request payload size and function execution time, and Vercel serverless functions have a body size ceiling (~4.5MB by default) that base64 images can approach.

**Approach:** since the app already depends on Cloudinary (per `next.config.mjs`'s `remotePatterns`), move to direct client-to-Cloudinary upload (signed upload params issued by a small backend endpoint) and have the registration/profile routes accept just the resulting URL. This is a bigger lift — touches the registration flow and needs a corresponding mobile-app change to actually do the direct upload — so it's listed here rather than done inline.

## Also worth doing, smaller scope

### 9. Systematic index audit across all 18 models
The last pass added indexes only to the two models (`CallRequest`, `Report`) flagged by the initial audit. A full pass — checking every model's frequently-queried fields (status, foreign keys, timestamps used in sort) against its actual index list — would likely turn up a few more gaps, following the same pattern as `Booking.js`'s existing indexes.

### 10. Cache warming after deploy
`/api/services` and `/api/admin/stats` now cache in Redis, but the first request after any deploy/cache-TTL-expiry is a full cache miss hitting the DB directly. For `/api/services` specifically (rarely-changing data), consider a deploy-time or cron-triggered cache warm so the very first real user request isn't the one paying the cold-cache cost.

### 11. Thundering-herd protection on cache-miss
If many concurrent requests hit a just-expired cache key at once (e.g. right after the 5-minute TTL on `/api/admin/stats` lapses), they'll all miss simultaneously and all hit the DB at once, momentarily defeating the point of the cache. A simple single-flight lock (first request to miss sets a short Redis lock and computes; concurrent misses wait briefly and retry the cache read) would smooth this out. Low priority — only matters once traffic to a given cached route is high enough for this to actually happen concurrently.
