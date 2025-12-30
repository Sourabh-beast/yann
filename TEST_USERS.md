# Test Users for Development

This document lists the test users available for development and testing. These users bypass SMS/Email OTP charges.

## 🧪 Test Mode

Test mode is automatically enabled when:
- `NODE_ENV === 'development'`
- `ENABLE_TEST_USERS === 'true'` in environment variables

## 📱 Member/Homeowner Test Users

Use these credentials to test the member/customer flow:

| Phone Number | Email | Name | OTP | Role |
|---|---|---|---|---|
| +919999900001 | member1@test.com | Test Member 1 | 1111 | homeowner |
| +919999900002 | member2@test.com | Test Member 2 | 2222 | homeowner |
| +919999900003 | member3@test.com | Test Member 3 | 3333 | homeowner |

## 🔧 Provider/Partner Test Users

Use these credentials to test the provider/partner flow:

| Phone Number | Email | Name | OTP | Role | Services |
|---|---|---|---|---|---|
| +919999900011 | provider1@test.com | Test Provider 1 | 1111 | provider | House Cleaning, AC Service Technicians |
| +919999900012 | provider2@test.com | Test Provider 2 | 2222 | provider | Drivers, Security Guards |
| +919999900013 | provider3@test.com | Test Provider 3 | 3333 | provider | Maids, Baby Sitters |

## 🚀 How to Use

### 1. Login with Phone Number

1. Open the app
2. Select "Member" or "Partner"
3. Enter one of the test phone numbers (e.g., `+919999900001`)
4. Click "Send OTP"
5. Enter the corresponding OTP (e.g., `1111`)
6. You're logged in! ✅

### 2. Login with Email

1. Open the app
2. Select "Member" or "Partner"
3. Enter one of the test emails (e.g., `member1@test.com`)
4. Click "Send OTP"
5. Enter the corresponding OTP (e.g., `1111`)
6. You're logged in! ✅

## 💡 Benefits

- **No SMS Charges**: Test users don't trigger actual SMS sending
- **Instant OTP**: No waiting for SMS delivery
- **Consistent Testing**: Same OTP every time for predictable testing
- **Multiple Users**: Test different user scenarios and interactions

## ⚠️ Important Notes

1. **Development Only**: Test users only work in development mode
2. **Don't Use in Production**: These users should never be accessible in production
3. **Predefined OTPs**: Each test user has a fixed OTP that never changes
4. **No Real Data**: Don't use these users for real bookings or transactions

## 🔐 Security

- Test mode is disabled in production automatically
- Test users are clearly marked in logs with 🧪 emoji
- OTPs are still hashed and stored securely
- All rate limiting and security features remain active

## 📝 Testing Scenarios

### Scenario 1: Member Books Service
1. Login as `member1@test.com` (OTP: 1111)
2. Browse services and create a booking
3. Wait for provider to accept

### Scenario 2: Provider Accepts Booking
1. Login as `provider1@test.com` (OTP: 1111)
2. View pending bookings
3. Accept a booking
4. Member receives OTP notification

### Scenario 3: Complete Job with OTP
1. Provider clicks "Start Job"
2. Enters OTP from member
3. Timer starts
4. Provider clicks "Complete Job"
5. Enters second OTP from member
6. Job completes with overtime calculation

## 🛠️ Adding More Test Users

Edit `Yann app/src/config/testUsers.js` to add more test users:

```javascript
{
  phone: '+919999900004',
  email: 'member4@test.com',
  name: 'Test Member 4',
  otp: '4444',
  role: 'homeowner'
}
```

## 📞 Support

If you encounter issues with test users, check:
1. Is `NODE_ENV` set to `development`?
2. Are you using the exact phone number format?
3. Are you entering the correct OTP for that user?
4. Check server logs for 🧪 test mode indicators
