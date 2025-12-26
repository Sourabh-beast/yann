import { NextResponse } from 'next/server';
import { retryOTPViaVoice, formatPhoneNumber, isPhoneNumber } from '@/lib/msg91';

export async function POST(request) {
  try {
    const { phone } = await request.json();
    
    if (!phone) {
      return NextResponse.json(
        { success: false, message: 'Phone number is required' },
        { status: 400 }
      );
    }
    
    // Validate phone number
    if (!isPhoneNumber(phone)) {
      return NextResponse.json(
        { success: false, message: 'Invalid phone number' },
        { status: 400 }
      );
    }
    
    // Send voice OTP via MSG91
    const result = await retryOTPViaVoice(phone);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message || 'You will receive a call shortly',
      });
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Voice OTP error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to initiate voice call' },
      { status: 500 }
    );
  }
}
