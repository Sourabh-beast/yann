import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Homeowner from '@/models/Homeowner';
import Booking from '@/models/Booking';
import Transaction from '@/models/Transaction';
import PlatformSettings from '@/models/PlatformSettings';
import { createAndSendNotification } from '@/lib/notificationHelper';
import ServiceProvider from '@/models/ServiceProvider';

/**
 * POST /api/bookings/pay-with-wallet
 * 
 * Wallet Payment Flow with 25% Escrow:
 * 1. Deduct 25% from user wallet (held in escrow)
 * 2. Create booking with walletPaymentStage: 'initial_25_held'
 * 3. When partner accepts → Release 25% to partner wallet
 * 4. When partner rejects (all) → Refund 25% to user wallet
 * 5. After job completion → User pays remaining 75%
 */
export async function POST(req) {
  try {
    // Extract user ID from request headers (sent by mobile app)
    const userId = req.headers.get('x-user-id');

    console.log('📥 Wallet payment request:', { userId: userId ? `${userId.substring(0, 8)}...` : 'missing' });

    if (!userId) {
      console.error('❌ Missing user ID');
      return NextResponse.json({ success: false, message: 'Unauthorized - User ID required' }, { status: 401 });
    }

    const bookingData = await req.json();
    const { totalPrice, bookingDate } = bookingData;

    console.log('💰 Booking total amount:', totalPrice);
    console.log('📅 Booking date:', bookingDate);

    await connectDB();

    // Validate MongoDB ObjectId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('❌ Invalid user ID format:', userId);
      return NextResponse.json(
        { success: false, message: 'Invalid user ID - please log out and log back in' },
        { status: 400 }
      );
    }

    const user = await Homeowner.findById(userId);
    if (!user) {
      console.error('❌ User not found:', userId);
      return NextResponse.json({ success: false, message: 'User not found - please log out and log back in' }, { status: 404 });
    }

    // Get platform settings for initial payment percentage
    let initialPercentage = 25; // Default to 25%
    try {
      const settings = await PlatformSettings.getSettings();
      console.log('📦 Settings walletPayment:', settings?.walletPayment);
      initialPercentage = settings?.walletPayment?.initialBookingPercentage || 25;
    } catch (settingsError) {
      console.warn('⚠️ Could not load platform settings, using default 25%:', settingsError.message);
    }

    // Calculate staged payment amounts - CRITICAL: Only 25% should be deducted
    const initialAmount = Math.round(totalPrice * (initialPercentage / 100) * 100) / 100; // 25%
    const completionAmount = Math.round((totalPrice - initialAmount) * 100) / 100; // 75%

    console.log('🔢 PAYMENT CALCULATION:');
    console.log(`   Total Price: ₹${totalPrice}`);
    console.log(`   Initial Percentage: ${initialPercentage}%`);
    console.log(`   Initial Amount (25%): ₹${initialAmount}`);
    console.log(`   Completion Amount (75%): ₹${completionAmount}`);

    const currentBalance = user.wallet?.balance || 0;

    console.log('💳 Current wallet balance:', currentBalance);

    // Check sufficient balance for initial amount only (25%)
    if (currentBalance < initialAmount) {
      console.error('❌ Insufficient balance for initial payment:', {
        required: initialAmount,
        available: currentBalance,
        totalBooking: totalPrice
      });
      return NextResponse.json({
        success: false,
        message: `Insufficient wallet balance. You need ₹${initialAmount} (${initialPercentage}% of ₹${totalPrice}) to book this service.`,
        required: initialAmount,
        available: currentBalance,
        totalPrice: totalPrice,
        initialPercentage: initialPercentage
      }, { status: 400 });
    }

    // Use MongoDB transaction for atomic wallet debit and booking creation
    const session = await Homeowner.startSession();
    session.startTransaction();

    let booking;
    const balanceBefore = currentBalance;
    const balanceAfter = currentBalance - initialAmount; // Only deduct 25%

    try {
      // Deduct 25% from wallet (ESCROW: held until provider accepts/rejects)
      user.wallet.balance = balanceAfter;
      await user.save({ session });

      console.log('✅ Wallet debited (25% held in escrow):', {
        before: balanceBefore,
        after: balanceAfter,
        escrowAmount: initialAmount
      });

      // Convert bookingDate string to Date object if needed
      const parsedBookingDate = typeof bookingDate === 'string' ? new Date(bookingDate) : bookingDate;

      // Create booking with 25% escrow payment status
      booking = await Booking.create([{
        ...bookingData,
        bookingDate: parsedBookingDate,
        paymentMethod: 'wallet',
        paymentStatus: 'partial', // Only 25% paid, 75% pending
        customerId: userId,
        // NEW: Wallet payment staging
        walletPaymentStage: 'initial_25_held',
        escrowDetails: {
          initialAmount: initialAmount,
          completionAmount: completionAmount,
          initialPaidAt: new Date(),
          initialReleasedAt: null,
          initialRefundedAt: null,
          completionPaidAt: null
        }
      }], { session });

      booking = booking[0]; // Extract from array

      console.log('✅ Booking created:', booking._id);
      console.log('📦 Escrow details:', booking.escrowDetails);

      // Log escrow_hold transaction
      await Transaction.create([{
        bookingId: booking._id,
        customerId: userId,
        providerId: bookingData.providerId || null,
        type: 'escrow_hold',
        amount: initialAmount,
        balanceBefore,
        balanceAfter,
        escrowStatus: 'held',
        paymentStage: 'initial_25',
        description: `${initialPercentage}% booking deposit held in escrow (₹${initialAmount} of ₹${totalPrice})`,
        status: 'completed',
        paymentMethod: 'wallet',
        currency: 'INR',
        serviceName: bookingData.serviceName,
        serviceCategory: bookingData.serviceCategory
      }], { session });

      console.log('✅ Escrow transaction logged');
      console.log('💡 25% will be transferred to provider when booking is accepted');
      console.log('💡 25% will be refunded to customer if all providers reject');
      console.log('💡 Remaining 75% will be paid after job completion');

      // Commit the transaction
      await session.commitTransaction();

      // Send notification to provider (outside transaction)
      if (bookingData.providerId) {
        try {
          const provider = await ServiceProvider.findById(bookingData.providerId);
          if (provider) {
            await createAndSendNotification({
              title: '🔔 New Booking Request!',
              message: `${booking.customerName} has requested ${booking.serviceName}. Tap to view details.`,
              recipientId: provider._id.toString(),
              recipientType: 'provider',
              pushToken: provider.pushToken,
              type: 'new_booking',
              data: {
                type: 'new_booking',
                bookingId: booking._id.toString()
              },
              bookingId: booking._id.toString()
            });
          }
        } catch (notifError) {
          console.error('Failed to send notification:', notifError);
          // Don't fail the booking if notification fails
        }
      }

    } catch (bookingError) {
      // CRITICAL: Rollback on any error
      await session.abortTransaction();
      console.error('❌ Transaction failed, rolled back:', bookingError.message);
      console.error('Error details:', bookingError);

      throw new Error(`Booking creation failed: ${bookingError.message}`);
    } finally {
      session.endSession();
    }

    return NextResponse.json({
      success: true,
      booking: {
        ...booking.toObject(),
        escrowDetails: booking.escrowDetails
      },
      newBalance: balanceAfter,
      paymentBreakdown: {
        initialAmount: initialAmount,
        completionAmount: completionAmount,
        initialPercentage: initialPercentage,
        totalPrice: totalPrice
      },
      message: `₹${initialAmount} (${initialPercentage}%) paid. Remaining ₹${completionAmount} due after service completion.`
    });

  } catch (error) {
    console.error('❌ Wallet booking error:', {
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json({
      success: false,
      message: error.message || 'Booking failed'
    }, { status: 500 });
  }
}
