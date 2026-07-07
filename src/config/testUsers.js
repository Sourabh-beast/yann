/**
 * Test Users Configuration
 * 
 * These users can login without sending actual SMS/Email OTPs
 * Use these for development and testing to avoid SMS charges
 * 
 * IMPORTANT: This should only be used in development/staging environments
 */

export const TEST_USERS = {
  // Homeowner/Member Test Users
  members: [
    {
      phone: '+919999900001',
      email: 'member1@test.com',
      name: 'Test Member 1',
      otp: '1111',
      role: 'homeowner'
    },
    {
      phone: '+919999900002',
      email: 'member2@test.com',
      name: 'Test Member 2',
      otp: '2222',
      role: 'homeowner'
    },
    {
      phone: '+919999900003',
      email: 'member3@test.com',
      name: 'Test Member 3',
      otp: '3333',
      role: 'homeowner'
    },
    // Bulk test range +91 77777 77771-75 - DB records seeded via scripts/seed-test-users.js
    { phone: '+917777777771', email: 'testhomeowner1@yanntest.com', name: 'Test Homeowner 1', otp: '1234', role: 'homeowner' },
    { phone: '+917777777772', email: 'testhomeowner2@yanntest.com', name: 'Test Homeowner 2', otp: '1234', role: 'homeowner' },
    { phone: '+917777777773', email: 'testhomeowner3@yanntest.com', name: 'Test Homeowner 3', otp: '1234', role: 'homeowner' },
    { phone: '+917777777774', email: 'testhomeowner4@yanntest.com', name: 'Test Homeowner 4', otp: '1234', role: 'homeowner' },
    { phone: '+917777777775', email: 'testhomeowner5@yanntest.com', name: 'Test Homeowner 5', otp: '1234', role: 'homeowner' },
    // Blank-slate range +91 77777 77781-83 - NO DB record pre-created, and (unlike the
    // other test users above) "Log In" will NOT silently auto-create one either -
    // blankSlate:true forces a real Sign Up. Run scripts/reset-test-users.js to wipe
    // the record and go back to requiring Sign Up again.
    { phone: '+917777777781', email: 'blanktest1@yanntest.com', name: 'Blank Test Homeowner 1', otp: '1234', role: 'homeowner', blankSlate: true },
    { phone: '+917777777782', email: 'blanktest2@yanntest.com', name: 'Blank Test Homeowner 2', otp: '1234', role: 'homeowner', blankSlate: true },
    { phone: '+917777777783', email: 'blanktest3@yanntest.com', name: 'Blank Test Homeowner 3', otp: '1234', role: 'homeowner', blankSlate: true },
  ],

  // Provider/Partner Test Users
  providers: [
    {
      phone: '+919999900011',
      email: 'provider1@test.com',
      name: 'Test Provider 1',
      otp: '1111',
      role: 'provider',
      services: ['House Cleaning', 'AC Service Technicians'],
      workingHours: { startTime: '09:00', endTime: '17:00' }
    },
    {
      phone: '+919999900012',
      email: 'provider2@test.com',
      name: 'Test Provider 2',
      otp: '2222',
      role: 'provider',
      services: ['Drivers', 'Security Guards'],
      workingHours: { startTime: '08:00', endTime: '16:00' }
    },
    {
      phone: '+919999900013',
      email: 'provider3@test.com',
      name: 'Test Provider 3',
      otp: '3333',
      role: 'provider',
      services: ['Maids', 'Baby Sitters'],
      workingHours: { startTime: '10:00', endTime: '18:00' }
    },
    // Bulk test range +91 77777 77776-80 - DB records seeded via scripts/seed-test-users.js
    // (services/rates on the DB record itself take precedence for existing users - these
    // fallback fields only matter if the record needs to be auto-created on first login)
    { phone: '+917777777776', email: 'testprovider1@yanntest.com', name: 'Test Provider 1', otp: '1234', role: 'provider', services: ['House Cleaning'], workingHours: { startTime: '09:00', endTime: '18:00' } },
    { phone: '+917777777777', email: 'testprovider2@yanntest.com', name: 'Test Provider 2', otp: '1234', role: 'provider', services: ['Electricians'], workingHours: { startTime: '09:00', endTime: '18:00' } },
    { phone: '+917777777778', email: 'testprovider3@yanntest.com', name: 'Test Provider 3', otp: '1234', role: 'provider', services: ['Maids'], workingHours: { startTime: '09:00', endTime: '18:00' } },
    { phone: '+917777777779', email: 'testprovider4@yanntest.com', name: 'Test Provider 4', otp: '1234', role: 'provider', services: ['Security Guards'], workingHours: { startTime: '09:00', endTime: '18:00' } },
    { phone: '+917777777780', email: 'testprovider5@yanntest.com', name: 'Test Provider 5', otp: '1234', role: 'provider', services: ['Plumbers'], workingHours: { startTime: '09:00', endTime: '18:00' } },
    // Blank-slate range +91 77777 77784-85 - NO DB record pre-created. blankSlate:true
    // means an OTP-login attempt before registering fails with "not found" (matching
    // real-user behavior) instead of silently auto-creating a bare account - you must
    // register via the real ProviderSignup form (POST /register) first. Once registered,
    // this entry lets you log back in with OTP 1234 instead of real SMS. Run
    // scripts/reset-test-users.js to wipe the record and require registration again.
    { phone: '+917777777784', email: 'blanktest4@yanntest.com', name: 'Blank Test Provider 1', otp: '1234', role: 'provider', services: [], workingHours: { startTime: '09:00', endTime: '18:00' }, blankSlate: true },
    { phone: '+917777777785', email: 'blanktest5@yanntest.com', name: 'Blank Test Provider 2', otp: '1234', role: 'provider', services: [], workingHours: { startTime: '09:00', endTime: '18:00' }, blankSlate: true },
  ]
};

/**
 * Normalize phone number to last 10 digits for comparison
 */
function normalizeIdentifier(id) {
  if (!id) return '';
  const str = id.toString();
  // If it looks like a phone number (mostly digits), normalize it
  if (/^[\d+\-\s]+$/.test(str) && str.replace(/\D/g, '').length >= 10) {
    return str.replace(/\D/g, '').slice(-10);
  }
  return str.toLowerCase().trim();
}

/**
 * Check if a phone number or email belongs to a test user
 */
export function isTestUser(identifier) {
  const normalizedInput = normalizeIdentifier(identifier);
  const allTestUsers = [...TEST_USERS.members, ...TEST_USERS.providers];
  
  return allTestUsers.some(user => {
    const normPhone = normalizeIdentifier(user.phone);
    const normEmail = normalizeIdentifier(user.email);
    return normPhone === normalizedInput || normEmail === normalizedInput;
  });
}

/**
 * Get test user by phone or email
 */
export function getTestUser(identifier) {
  const normalizedInput = normalizeIdentifier(identifier);
  const allTestUsers = [...TEST_USERS.members, ...TEST_USERS.providers];
  
  return allTestUsers.find(user => {
    const normPhone = normalizeIdentifier(user.phone);
    const normEmail = normalizeIdentifier(user.email);
    return normPhone === normalizedInput || normEmail === normalizedInput;
  });
}

/**
 * Get the predefined OTP for a test user
 */
export function getTestOTP(identifier) {
  const user = getTestUser(identifier);
  return user ? user.otp : null;
}

/**
 * Check if we're in test mode (development environment)
 */
export function isTestMode() {
  return process.env.NODE_ENV === 'development' || 
         process.env.ENABLE_TEST_USERS === 'true';
}
