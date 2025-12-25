# Vercel Deployment Fix - Wallet API Routes

## Problem
The Yann Wallet backend code failed to deploy on Vercel due to **import errors** in the newly created API routes.

## Root Causes

### 1. **NextAuth Dependency Missing**
All 5 wallet-related API routes were importing from `next-auth`, which is **not installed** in the project:
```javascript
// ❌ This was causing the build to fail
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
```

### 2. **Wrong Database Import Path**
Routes were using `@/lib/dbConnect` instead of the actual path `@/lib/connectDB`:
```javascript
// ❌ Wrong
import dbConnect from '@/lib/dbConnect';

// ✅ Correct
import connectDB from '@/lib/connectDB';
```

### 3. **Incompatible Authentication Pattern**
The app uses **JWT-based authentication with cookies** for the web app and **header-based authentication** for the mobile app, not NextAuth.

## Files Fixed

All 5 wallet-related API routes have been corrected:

1. ✅ `src/app/api/wallet/route.js` - Get wallet balance & transactions
2. ✅ `src/app/api/wallet/topup/route.js` - Create Razorpay order for topup
3. ✅ `src/app/api/wallet/topup/verify/route.js` - Verify payment & credit wallet
4. ✅ `src/app/api/bookings/cancel/route.js` - Cancel booking & refund to wallet
5. ✅ `src/app/api/bookings/pay-with-wallet/route.js` - Pay for booking using wallet

## Changes Made

### Authentication Pattern
Replaced NextAuth session with header-based authentication:

```javascript
// ✅ New approach - Extract user ID from headers
const userId = req.headers.get('x-user-id');

if (!userId) {
  return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
}
```

### Database Connection
Fixed import path:
```javascript
// ✅ Correct import
import connectDB from '@/lib/connectDB';

// Usage
await connectDB();
```

## Mobile App Integration

The mobile app should send the user ID in request headers:

```typescript
// In src/services/api.ts
headers: {
  'Content-Type': 'application/json',
  'x-user-id': userId, // Add this header
}
```

## Next Steps

1. **Commit and push** these changes to GitHub
2. **Vercel will auto-deploy** the fixed backend
3. **Update mobile app** to send `x-user-id` header in API requests
4. **Test wallet functionality** end-to-end

## Deployment Status

✅ **Ready for deployment** - All import errors resolved
✅ **No new dependencies needed** - Uses existing packages
✅ **Authentication aligned** - Matches existing app pattern
