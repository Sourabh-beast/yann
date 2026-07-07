import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import { applyReferral, ReferralError } from '@/lib/referral';

const ERROR_STATUS = {
  INVALID_CODE: 400,
  ALREADY_APPLIED: 409,
  SELF_REFERRAL: 400,
  REFERRAL_DISABLED: 403,
  USER_NOT_FOUND: 404
};

/**
 * POST /api/homeowner/referral/apply
 * Body: { code: string }
 * Applies a referral code to the calling homeowner (one-time use).
 */
export async function POST(req) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { code } = body;

    await connectDB();

    const result = await applyReferral({ refereeId: userId, code });

    return NextResponse.json({
      success: true,
      message: `₹${result.refereeBonus} bonus credit added to your wallet!`,
      data: result
    });
  } catch (error) {
    if (error instanceof ReferralError) {
      return NextResponse.json(
        { success: false, code: error.code, message: error.message },
        { status: ERROR_STATUS[error.code] || 400 }
      );
    }
    console.error('Referral apply error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
