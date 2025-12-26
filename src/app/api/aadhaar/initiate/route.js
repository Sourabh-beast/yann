import { NextResponse } from 'next/server';

const MEON_API_BASE = 'https://api.meon.co.in';
const COMPANY_ID = '66005';
const SECRET_KEY = process.env.MEON_SECRET_KEY || 'rhJ8OqF5HytSI1CRGmRSgTrQcd4bWsVD';

/**
 * POST /api/aadhaar/initiate
 * Initiate Aadhaar verification via Meon DigiLocker
 * 
 * Request body:
 * {
 *   userId: string,
 *   userType: 'homeowner' | 'provider',
 *   aadhaarNumber: string (12 digits)
 * }
 */
export async function POST(request) {
  try {
    const { userId, userType, aadhaarNumber } = await request.json();

    // Validate input
    if (!userId || !userType || !aadhaarNumber) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!/^\d{12}$/.test(aadhaarNumber)) {
      return NextResponse.json(
        { success: false, message: 'Invalid Aadhaar number format' },
        { status: 400 }
      );
    }

    // Call Meon API to initiate verification
    const meonResponse = await fetch(`${MEON_API_BASE}/v1/digilocker/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': SECRET_KEY,
        'x-company-id': COMPANY_ID,
      },
      body: JSON.stringify({
        aadhaar_number: aadhaarNumber,
        consent: true,
        callback_url: `${process.env.NEXT_PUBLIC_API_URL}/api/aadhaar/webhook`,
        client_ref_id: `${userType}_${userId}_${Date.now()}`,
      }),
    });

    const meonData = await meonResponse.json();

    if (!meonResponse.ok) {
      console.error('❌ Meon API error:', meonData);
      return NextResponse.json(
        { 
          success: false, 
          message: meonData.message || 'Failed to initiate verification' 
        },
        { status: meonResponse.status }
      );
    }

    // Return verification URL to mobile app
    return NextResponse.json({
      success: true,
      data: {
        verificationUrl: meonData.data?.verification_url || meonData.verification_url,
        requestId: meonData.data?.request_id || meonData.request_id,
        expiresAt: meonData.data?.expires_at || meonData.expires_at,
      },
    });

  } catch (error) {
    console.error('❌ Error initiating Aadhaar verification:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
