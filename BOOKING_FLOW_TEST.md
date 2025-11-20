# Booking Flow Test Guide

## Complete Flow Testing

### Step 1: Register a Provider with "Havan Ceremony" service
1. Go to: http://localhost:3000
2. Click "Partner Registration" or go to registration modal
3. Fill details:
   - Name: Test Pujari
   - Email: pujari@test.com
   - Phone: 9876543210
   - Experience: 5
   - Services: **Select "Havan Ceremony"** (exact name from Pujari Services category)
   - Working Hours: 09:00 - 17:00
4. Submit registration
5. Provider saved in database with services: ["Havan Ceremony"]

### Step 2: Login as Provider
1. Go to: http://localhost:3000/provider-login
2. Enter email: pujari@test.com
3. Login successful
4. Redirected to: http://localhost:3000/provider-dashboard

### Step 3: Create a Booking for "Havan Ceremony"
1. Go to: http://localhost:3000/services
2. Login as customer (if required)
3. Find "Havan Ceremony" service card
4. Click "Book Now"
5. Fill booking details:
   - Date: Select future date
   - Time: Select time slot
   - Add any extras (optional)
   - Notes: "Need traditional setup"
6. Click "Confirm Booking"
7. Enter phone: 9999999999
8. Enter address: "123 Test Street, Delhi"
9. Booking created!

### Step 4: Check Provider Dashboard
1. Provider at http://localhost:3000/provider-dashboard should see:
   - New booking request in "Pending" tab
   - Customer details
   - Service: "Havan Ceremony"
   - Date, time, address
   - Accept/Reject buttons

### Step 5: Check Admin Panel
1. Go to: http://localhost:3000/admin/bookings
2. See all bookings
3. For "Havan Ceremony" booking, see:
   - Booking details
   - Customer info
   - **Provider Assignment section showing**:
     - "This booking was sent to 1 provider(s)"
     - Provider card with name, email, phone
     - Status: active
     - Experience: 5 yrs

## Important Notes

### Service Name Must Match EXACTLY:
- Registration modal: **"Havan Ceremony"** 
- Booking page: **"Havan Ceremony"**
- Database: services: ["Havan Ceremony"]

### MongoDB Query Fixed:
```javascript
// OLD (WRONG):
services: serviceName  // This doesn't work for array fields

// NEW (CORRECT):
services: { $in: [serviceName] }  // This searches in array
```

### Check Console Logs:
When booking is created, you should see:
```
🔍 Searching for providers with service: Havan Ceremony
📢 Booking created! Found 1 providers for "Havan Ceremony"
✅ Providers who will receive this booking:
   - Test Pujari (pujari@test.com) - Services: [Havan Ceremony]
```

If no providers found:
```
⚠️ WARNING: No providers found for this service!
💡 Tip: Make sure providers register with exact service name: Havan Ceremony
```

## Troubleshooting

### Provider not seeing booking?
1. Check provider status is "active" (not "pending")
2. Check provider.services array contains EXACT service name
3. Check MongoDB query in `/api/bookings/create`
4. Check provider email matches login

### No providers shown in admin panel?
1. Check `/api/admin/providers?simple=true` returns data
2. Check provider registered successfully
3. Check MongoDB connection

### Booking not created?
1. Check browser console for errors
2. Check `/api/bookings/create` response
3. Check all required fields filled
4. Check MongoDB connection

## URLs
- Homepage: http://localhost:3000
- Services: http://localhost:3000/services
- Provider Login: http://localhost:3000/provider-login
- Provider Dashboard: http://localhost:3000/provider-dashboard
- Admin Panel: http://localhost:3000/admin/bookings
