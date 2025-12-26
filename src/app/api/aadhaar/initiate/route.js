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

    // Log configuration for debugging
    console.log('🔍 Aadhaar verification request:', {
      userId: userId ? 'present' : 'missing',
      userType,
      aadhaarNumber: aadhaarNumber ? `${aadhaarNumber.substring(0, 4)}****${aadhaarNumber.substring(8)}` : 'missing',
      hasSecretKey: !!SECRET_KEY,
      hasApiUrl: !!process.env.NEXT_PUBLIC_API_URL,
      callbackUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/aadhaar/webhook`,
    });

    // Call Meon API to initiate verification
    const meonPayload = {
      aadhaar_number: aadhaarNumber,
      consent: true,
      callback_url: `${process.env.NEXT_PUBLIC_API_URL}/api/aadhaar/webhook`,
      client_ref_id: `${userType}_${userId}_${Date.now()}`,
    };

    console.log('📤 Calling Meon API with payload:', {
      ...meonPayload,
      aadhaar_number: `${aadhaarNumber.substring(0, 4)}****${aadhaarNumber.substring(8)}`,
    });

    const meonResponse = await fetch(`${MEON_API_BASE}/v1/digilocker/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': SECRET_KEY,
        'x-company-id': COMPANY_ID,
      },
      body: JSON.stringify(meonPayload),
    });

    const meonData = await meonResponse.json();

    console.log('📥 Meon API response:', {
      status: meonResponse.status,
      ok: meonResponse.ok,
      data: meonData,
    });

    if (!meonResponse.ok) {
      console.error('❌ Meon API error:', {
        status: meonResponse.status,
        statusText: meonResponse.statusText,
        data: meonData,
      });
      return NextResponse.json(
        { 
          success: false, 
          message: meonData.message || meonData.error || 'Failed to initiate verification',
          details: meonData,
        },
        { status: meonResponse.status }
      );
    }

    console.log('✅ Verification initiated successfully');

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
    console.error('❌ Error initiating Aadhaar verification:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
