# Debug Live Bookings Issue

## Step 1: Check Database State
Open browser and go to:
```
http://localhost:3001/api/debug/bookings
```

This will show:
- Total bookings in database
- Total providers in database
- Recent bookings (service names, status)
- All providers (names, services arrays)

## Step 2: Check Specific Provider
```
http://localhost:3001/api/debug/bookings?email=YOUR_PROVIDER_EMAIL
```
Replace YOUR_PROVIDER_EMAIL with actual provider email.

This will show:
- Provider details
- Provider's services array
- Matching bookings for this provider

## Step 3: Test Complete Flow

### A. Register Provider (if not done)
1. Go to: http://localhost:3001
2. Open Partner Registration modal
3. Fill details:
   - Name: Test Provider
   - Email: test@provider.com
   - Phone: 9876543210
   - Experience: 5
   - **Services: Check "Havan Ceremony"** (EXACT name from dropdown)
4. Submit

### B. Login as Provider
1. Go to: http://localhost:3001/provider-login
2. Email: test@provider.com
3. Login
4. Should redirect to: http://localhost:3001/provider-dashboard

### C. Create Booking
1. Open NEW INCOGNITO window (to act as customer)
2. Go to: http://localhost:3001/services
3. Login as resident/customer
4. Find "Havan Ceremony" service
5. Click "Book Now"
6. Fill details:
   - Date: Tomorrow
   - Time: 10:00
7. Click "Confirm Booking"
8. Enter phone: 9999999999
9. Enter address: Test Address 123

### D. Check Provider Dashboard
1. Go back to provider window
2. Refresh: http://localhost:3001/provider-dashboard
3. Should see booking in "Pending Requests" tab

## Common Issues & Solutions

### Issue 1: No bookings showing
**Check:**
```
http://localhost:3001/api/debug/bookings?email=test@provider.com
```

Look for:
- `matchedProvider.services` array
- `matchingBookings` array
- Compare service names EXACTLY

**Solution:**
- Service names must match EXACTLY
- Provider: `["Havan Ceremony"]`
- Booking: `serviceName: "Havan Ceremony"`
- Case-sensitive!

### Issue 2: Provider not found
**Check:**
```
http://localhost:3001/api/debug/bookings
```

Look for provider in `allProviders` list.

**Solution:**
- Re-register provider
- Check email is correct
- Check provider status is "active" (not "pending")

### Issue 3: Booking created but not matching
**Check console logs when booking is created:**

Should see:
```
🔍 Searching for providers with service: Havan Ceremony
📢 Booking created! Found 1 providers for "Havan Ceremony"
✅ Providers who will receive this booking:
   - Provider Name (email) - Services: [Havan Ceremony]
```

If shows "Found 0 providers":
- Service name mismatch
- Provider services array doesn't contain exact name
- Provider status is not "active"

### Issue 4: Provider sees no bookings in dashboard
**Check console logs when provider dashboard loads:**

Should see:
```
🔍 Provider found: Provider Name
📋 Provider services: ["Havan Ceremony"]
✅ Provider status: active
📢 Found 1 pending bookings for provider Provider Name
   - Havan Ceremony (Customer Name) - Date
```

If shows "Found 0 pending bookings":
1. Check if booking was created (check /api/debug/bookings)
2. Check if service names match exactly
3. Check if booking status is "pending"

## Testing Checklist

- [ ] Provider registered successfully
- [ ] Provider status is "active" 
- [ ] Provider has exact service name in services array
- [ ] Booking created successfully
- [ ] Console shows "Found X providers" > 0
- [ ] Console shows provider details
- [ ] /api/debug/bookings shows matching data
- [ ] Provider dashboard loads without errors
- [ ] Provider sees booking in "Pending Requests"

## Quick Test Script

Run in browser console on services page after booking:
```javascript
fetch('/api/debug/bookings')
  .then(r => r.json())
  .then(data => {
    console.table(data.debug.recentBookings);
    console.table(data.debug.allProviders);
  });
```

## Contact Flow Verification

1. **Booking Creation** → `/api/bookings/create`
   - Creates booking in database
   - Finds matching providers
   - Logs provider details

2. **Provider Login** → Stores email in localStorage

3. **Dashboard Load** → `/api/provider/requests?email=XXX`
   - Fetches provider by email
   - Finds bookings where serviceName IN provider.services
   - Returns pendingRequests array

4. **UI Display** → Shows bookings in dashboard

Each step should log to console. Check browser console AND terminal for logs.
