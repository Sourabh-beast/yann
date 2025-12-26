import { NextResponse } from 'next/server';

/**
 * GET /api/aadhaar/test-config
 * Test endpoint to verify environment variables are loaded
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    config: {
      hasMeonSecretKey: !!process.env.MEON_SECRET_KEY,
      hasMeonCompanyId: !!process.env.MEON_COMPANY_ID,
      hasApiUrl: !!process.env.NEXT_PUBLIC_API_URL,
      meonSecretKeyLength: process.env.MEON_SECRET_KEY?.length || 0,
      meonCompanyId: process.env.MEON_COMPANY_ID || 'missing',
      apiUrl: process.env.NEXT_PUBLIC_API_URL || 'missing',
    }
  });
}
