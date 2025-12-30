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
  ]
};

/**
 * Check if a phone number or email belongs to a test user
 */
export function isTestUser(identifier: string): boolean {
  const allTestUsers = [...TEST_USERS.members, ...TEST_USERS.providers];
  return allTestUsers.some(
    user => user.phone === identifier || user.email === identifier
  );
}

/**
 * Get test user by phone or email
 */
export function getTestUser(identifier: string) {
  const allTestUsers = [...TEST_USERS.members, ...TEST_USERS.providers];
  return allTestUsers.find(
    user => user.phone === identifier || user.email === identifier
  );
}

/**
 * Get the predefined OTP for a test user
 */
export function getTestOTP(identifier: string): string | null {
  const user = getTestUser(identifier);
  return user ? user.otp : null;
}

/**
 * Check if we're in test mode (development environment)
 */
export function isTestMode(): boolean {
  return process.env.NODE_ENV === 'development' || 
         process.env.ENABLE_TEST_USERS === 'true';
}
