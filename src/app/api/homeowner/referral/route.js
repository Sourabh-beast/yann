import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Homeowner from '@/models/Homeowner';
import PlatformSettings from '@/models/PlatformSettings';
import { generateReferralCode } from '@/lib/referral';

/**
 * GET /api/homeowner/referral
 * Returns the caller's own referral code (generating one on first access if
 * missing - covers homeowners created before this feature existed), stats,
 * and the current program terms.
 */
export async function GET(req) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await Homeowner.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    if (!user.referralCode) {
      user.referralCode = await generateReferralCode(user.name);
      await user.save();
    }

    const settings = await PlatformSettings.getSettings();
    const referralSettings = settings?.referral || {};

    return NextResponse.json({
      success: true,
      data: {
        referralCode: user.referralCode,
        hasAppliedCode: !!user.referredBy,
        totalReferred: user.referralStats?.totalReferred || 0,
        totalReferralEarnings: user.referralStats?.totalReferralEarnings || 0,
        bonusBalance: user.wallet?.bonusBalance || 0,
        enabled: referralSettings.enabled !== false,
        refereeSignupBonus: referralSettings.refereeSignupBonus ?? 200,
        referrerBonus: referralSettings.referrerBonus ?? 50,
        bonusSpendCapPercent: referralSettings.bonusSpendCapPercent ?? 20,
        shareMessage: `Use my code ${user.referralCode} on Yann and get ₹${referralSettings.refereeSignupBonus ?? 200} bonus credit on signup!`
      }
    });
  } catch (error) {
    console.error('Referral GET error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
