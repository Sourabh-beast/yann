import Homeowner from '@/models/Homeowner';
import Transaction from '@/models/Transaction';
import PlatformSettings from '@/models/PlatformSettings';
import { createAndSendNotification } from '@/lib/notificationHelper';

// Ambiguous characters (0/O, 1/I/L) excluded to keep codes easy to read/type
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomSuffix(length = 4) {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return out;
}

export class ReferralError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'ReferralError';
    this.code = code;
  }
}

/**
 * Generates a unique, human-shareable referral code for a homeowner.
 * e.g. "ROHI7F2K" for name "Rohit"
 */
export async function generateReferralCode(name) {
  const base = (name || '')
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase()
    .slice(0, 4)
    .padEnd(4, 'X') || 'YANN';

  for (let attempt = 0; attempt < 8; attempt++) {
    const code = `${base}${randomSuffix(4)}`;
    const existing = await Homeowner.findOne({ referralCode: code }).select('_id').lean();
    if (!existing) return code;
  }
  // Extremely unlikely fallback if 8 collisions in a row
  return `YANN${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

/**
 * Applies a referral code to a newly-created (or not-yet-referred) homeowner.
 * Credits the referee's bonusBalance immediately and the referrer's real
 * wallet.balance, inside a single Mongo transaction. One-time use per referee.
 */
export async function applyReferral({ refereeId, code }) {
  if (!code || typeof code !== 'string' || !code.trim()) {
    throw new ReferralError('INVALID_CODE', 'Referral code is required');
  }
  const normalizedCode = code.trim().toUpperCase();

  const settings = await PlatformSettings.getSettings();
  const referralSettings = settings?.referral || {};
  if (referralSettings.enabled === false) {
    throw new ReferralError('REFERRAL_DISABLED', 'Referral program is currently disabled');
  }

  const referee = await Homeowner.findById(refereeId);
  if (!referee) {
    throw new ReferralError('USER_NOT_FOUND', 'User not found');
  }
  if (referee.referredBy || referee.referralCodeAppliedAt) {
    throw new ReferralError('ALREADY_APPLIED', 'A referral code has already been applied to this account');
  }
  if (referee.referralCode === normalizedCode) {
    throw new ReferralError('SELF_REFERRAL', 'You cannot use your own referral code');
  }

  const referrer = await Homeowner.findOne({ referralCode: normalizedCode });
  if (!referrer) {
    throw new ReferralError('INVALID_CODE', 'Invalid referral code');
  }
  if (referrer._id.equals(referee._id)) {
    throw new ReferralError('SELF_REFERRAL', 'You cannot use your own referral code');
  }

  const refereeBonus = referralSettings.refereeSignupBonus ?? 200;
  const referrerBonus = referralSettings.referrerBonus ?? 50;
  const maxReferrals = referralSettings.maxReferrals || 0;
  const referrerHasCapacity = !maxReferrals || (referrer.referralStats?.totalReferred || 0) < maxReferrals;

  const session = await Homeowner.startSession();
  session.startTransaction();
  try {
    const refereeBalanceBefore = referee.wallet.balance || 0;

    referee.wallet.bonusBalance = (referee.wallet.bonusBalance || 0) + refereeBonus;
    referee.wallet.bonusBalanceGranted = (referee.wallet.bonusBalanceGranted || 0) + refereeBonus;
    referee.referredBy = referrer._id;
    referee.referralCodeAppliedAt = new Date();
    await referee.save({ session });

    await Transaction.create([{
      customerId: referee._id,
      type: 'referral_bonus',
      amount: refereeBonus,
      status: 'completed',
      paymentMethod: 'wallet',
      description: `Referral signup bonus from code ${normalizedCode}`,
      walletBreakdown: { bonusUsed: refereeBonus, realUsed: 0 },
      balanceBefore: refereeBalanceBefore,
      balanceAfter: refereeBalanceBefore // real balance unaffected - bonus goes to bonusBalance
    }], { session });

    let referrerCredited = false;
    if (referrerHasCapacity) {
      const referrerBonusBalanceBefore = referrer.wallet.bonusBalance || 0;
      // Referrer earnings go into the same spend-capped bucket as referee signup
      // bonuses (not the real balance) - so ₹50 earned here is also only usable
      // at 20% of its granted amount (₹10) per single booking payment, same as
      // referee bonuses, rather than being freely spendable all at once.
      referrer.wallet.bonusBalance = referrerBonusBalanceBefore + referrerBonus;
      referrer.wallet.bonusBalanceGranted = (referrer.wallet.bonusBalanceGranted || 0) + referrerBonus;
      referrer.referralStats.totalReferred = (referrer.referralStats?.totalReferred || 0) + 1;
      referrer.referralStats.totalReferralEarnings = (referrer.referralStats?.totalReferralEarnings || 0) + referrerBonus;
      await referrer.save({ session });

      await Transaction.create([{
        customerId: referrer._id,
        type: 'referral_bonus',
        amount: referrerBonus,
        status: 'completed',
        paymentMethod: 'wallet',
        description: `Referral reward for inviting ${referee.name || 'a new user'}`,
        walletBreakdown: { bonusUsed: referrerBonus, realUsed: 0 },
        balanceBefore: referrerBonusBalanceBefore,
        balanceAfter: referrer.wallet.bonusBalance
      }], { session });
      referrerCredited = true;
    }

    await session.commitTransaction();

    // Notify the referrer - best-effort, must not fail the referral itself
    try {
      await createAndSendNotification({
        title: '🎉 Friend Referred Successfully!',
        message: referrerCredited
          ? `${referee.name || 'Your friend'} just signed up using your referral code! ₹${referrerBonus} has been added to your wallet.`
          : `${referee.name || 'Your friend'} just signed up using your referral code!`,
        recipientId: referrer._id.toString(),
        recipientType: 'homeowner',
        pushToken: referrer.pushToken,
        type: 'referral_success',
        data: {
          type: 'referral_success',
          refereeName: referee.name || '',
          referrerBonus: referrerCredited ? referrerBonus : 0
        }
      });
    } catch (notifError) {
      console.error('Failed to send referral success notification:', notifError);
    }

    return {
      refereeBonus,
      referrerBonus: referrerCredited ? referrerBonus : 0,
      referrerName: referrer.name,
      newBonusBalance: referee.wallet.bonusBalance
    };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

/**
 * Splits a wallet payment (amountDue) between bonusBalance and the real
 * wallet.balance. bonusBalance usage is capped per single transaction at
 * capPercent% of wallet.bonusBalanceGranted (the fixed lifetime-granted
 * amount, NOT the shrinking live balance) - so the cap stays constant across
 * transactions instead of decaying as bonusBalance is spent down.
 */
export function computeWalletDebit({ homeowner, amountDue, capPercent }) {
  const bonusBalance = homeowner.wallet?.bonusBalance || 0;
  const bonusGranted = homeowner.wallet?.bonusBalanceGranted || 0;
  const realBalance = homeowner.wallet?.balance || 0;
  const effectiveCapPercent = capPercent ?? 20;

  const maxBonusPerTransaction = Math.floor(bonusGranted * (effectiveCapPercent / 100));
  const bonusToUse = Math.max(0, Math.min(bonusBalance, maxBonusPerTransaction, amountDue));
  const realToUse = Math.max(0, amountDue - bonusToUse);

  return {
    bonusToUse,
    realToUse,
    sufficient: realBalance >= realToUse
  };
}
