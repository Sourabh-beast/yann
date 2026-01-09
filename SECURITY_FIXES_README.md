# Security Fixes - Setup Instructions

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd Yann-Website
npm install zod
```

### 2. Set Up Database Indexes
Run the indexing script to improve query performance:
```bash
node scripts/setupIndexes.js
```

This will create 20 optimized indexes across your collections.

### 3. Verify Environment Variables
Ensure these critical environment variables are set:

```bash
# Required for security
JWT_SECRET=<your-secret-key>  # MUST be set, no fallback
MONGODB_URI=<your-mongodb-uri>

# Required for admin access
ADMIN_EMAIL=<admin-email>
ADMIN_PASSWORD=<strong-password>

# Required for OTP
EMAIL_USER=<gmail-address>
EMAIL_PASS=<gmail-app-password>
```

## 📋 What's Been Fixed

### ✅ Critical Security Fixes
1. **Wallet Transaction Atomicity** - Prevents money loss
2. **Rate Limiting** - Prevents SMS cost explosion
3. **Extended Sessions** - 30 days instead of 1 hour
4. **Authorization Middleware** - Prevents unauthorized access
5. **Input Validation** - Prevents NoSQL injection and XSS
6. **Database Indexes** - Prevents performance issues

### 📁 New Files Created
- `src/lib/rateLimiter.js` - Rate limiting middleware
- `src/lib/authMiddleware.js` - Authorization helpers
- `src/lib/validation.js` - Input validation with Zod
- `scripts/setupIndexes.js` - Database indexing script

### 📝 Modified Files
- `src/app/api/job/verify-end/route.js` - Added MongoDB transactions
- `src/app/api/auth/send-otp/route.js` - Added rate limiting
- `src/app/api/auth/verify-otp/route.js` - Extended session timeout
- `src/app/api/bookings/create/route.js` - Added IDOR protection

## 🧪 Testing

### Test Wallet Transactions
```bash
# Create a booking with overtime
# Simulate failure mid-transaction
# Verify rollback occurred
```

### Test Rate Limiting
```bash
# Send 4 OTP requests rapidly
# 4th request should return 429 status
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test@example.com","audience":"homeowner"}'
```

### Test IDOR Protection
```bash
# Try to create booking for another user
# Should return 403 Forbidden
```

## ⚠️ Important Notes

> **MongoDB Transactions Requirement**
> MongoDB transactions require a replica set. If using MongoDB Atlas, this is already configured. For local development, you may need to set up a replica set.

> **Test Users Still Present**
> Test user backdoors are still in the code per your request. Remember to remove these before production launch.

> **Rate Limiting Storage**
> Rate limiting uses in-memory storage. For production with multiple servers, consider Redis.

## 🔄 Next Steps

1. **Apply input validation** to more endpoints using the validation middleware
2. **Set up error monitoring** (Sentry free tier)
3. **Implement pagination** on list endpoints
4. **Remove test user backdoors** before production launch

## 📚 Usage Examples

### Using Rate Limiting
```javascript
import { applyRateLimit, otpRateLimiter } from '@/lib/rateLimiter';

export async function POST(request) {
  const rateLimitResult = applyRateLimit(request, otpRateLimiter);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { success: false, message: rateLimitResult.message },
      { status: 429 }
    );
  }
  // ... rest of handler
}
```

### Using Authorization
```javascript
import { requireAuth, verifyOwnership } from '@/lib/authMiddleware';

export async function POST(request) {
  const authResult = requireAuth(request);
  if (!authResult.authorized) return authResult.response;
  
  const booking = await Booking.findById(bookingId);
  if (!verifyOwnership(authResult.user, booking.customerId)) {
    return NextResponse.json(
      { success: false, message: 'Forbidden' },
      { status: 403 }
    );
  }
  // ... rest of handler
}
```

### Using Input Validation
```javascript
import { validateInput, bookingCreateSchema } from '@/lib/validation';

export async function POST(request) {
  const body = await request.json();
  const validation = validateInput(body, bookingCreateSchema);
  
  if (!validation.success) {
    return NextResponse.json(
      { success: false, message: validation.message },
      { status: 400 }
    );
  }
  
  const validatedData = validation.data;
  // ... use validatedData
}
```

## 🎯 Security Checklist

- [x] Wallet transaction atomicity
- [x] Rate limiting on OTP endpoints
- [x] Extended session timeout
- [x] Authorization middleware created
- [x] Input validation middleware created
- [x] Database indexes script created
- [ ] Run database indexes
- [ ] Apply validation to all endpoints
- [ ] Set up error monitoring
- [ ] Remove test user backdoors
- [ ] Security audit
- [ ] Load testing

## 📞 Support

If you encounter any issues:
1. Check environment variables are set correctly
2. Verify MongoDB supports transactions (replica set)
3. Review the implementation plan for detailed information
