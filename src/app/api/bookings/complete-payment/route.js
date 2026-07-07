import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Homeowner from '@/models/Homeowner';
import ServiceProvider from '@/models/ServiceProvider';
import Booking from '@/models/Booking';
import Transaction from '@/models/Transaction';
import Notification from '@/models/Notification';
import PlatformSettings from '@/models/PlatformSettings';
import { createAndSendNotification } from '@/lib/notificationHelper';
import { computeWalletDebit } from '@/lib/referral';

/**
 * POST /api/bookings/complete-payment
 * 
 * Completion Payment Flow (75% remaining):
 * Called after job is completed to pay the remaining 75% from user wallet to partner.
 * 
 * Prerequisites:
 * - Booking status must be 'completed'
 * - walletPaymentStage must be 'initial_25_released'
 * - User must have sufficient wallet balance for 75%
 */
export async function POST(req) {
    try {
        // Extract user ID from request headers
        const userId = req.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized - User ID required' },
                { status: 401 }
            );
        }

        const { bookingId } = await req.json();

        if (!bookingId) {
            return NextResponse.json(
                { success: false, message: 'Booking ID is required' },
                { status: 400 }
            );
        }

        await connectDB();

        // Validate MongoDB ObjectId format
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(bookingId)) {
            return NextResponse.json(
                { success: false, message: 'Invalid ID format' },
                { status: 400 }
            );
        }

        // Find the booking
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return NextResponse.json(
                { success: false, message: 'Booking not found' },
                { status: 404 }
            );
        }

        // Validate booking belongs to this user
        if (booking.customerId.toString() !== userId) {
            return NextResponse.json(
                { success: false, message: 'You are not authorized to pay for this booking' },
                { status: 403 }
            );
        }

        // Validate booking status - accept either awaiting_completion_payment or completed (for legacy bookings)
        if (booking.status !== 'completed' && booking.status !== 'awaiting_completion_payment') {
            return NextResponse.json(
                { success: false, message: 'Invalid booking status for completion payment' },
                { status: 400 }
            );
        }

        // Validate payment stage - accept initial_25_held or awaiting_completion_payment
        if (booking.walletPaymentStage !== 'initial_25_held' && booking.walletPaymentStage !== 'awaiting_completion_payment') {
            if (booking.walletPaymentStage === 'completed') {
                return NextResponse.json(
                    { success: false, message: 'Payment already completed for this booking' },
                    { status: 400 }
                );
            }
            return NextResponse.json(
                { success: false, message: `Invalid payment stage: ${booking.walletPaymentStage}. Initial payment must be completed first.` },
                { status: 400 }
            );
        }

        // Get user and provider
        const user = await Homeowner.findById(userId);
        const provider = await ServiceProvider.findById(booking.assignedProvider);

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        if (!provider) {
            return NextResponse.json(
                { success: false, message: 'Service provider not found' },
                { status: 404 }
            );
        }

        // Calculate completion amount (75%)
        const completionAmount = booking.escrowDetails?.completionAmount || (booking.totalPrice * 0.75);
        const userBalance = user.wallet?.balance || 0;
        const userBonusBalance = user.wallet?.bonusBalance || 0;

        console.log('💳 Completion payment request:');
        console.log(`   User balance: ₹${userBalance} | bonus: ₹${userBonusBalance}`);
        console.log(`   Completion amount (75%): ₹${completionAmount}`);

        let bonusSpendCapPercent = 20;
        try {
            const settings = await PlatformSettings.getSettings();
            bonusSpendCapPercent = settings?.referral?.bonusSpendCapPercent ?? 20;
        } catch (settingsError) {
            console.warn('⚠️ Could not load referral settings, using default 20% cap:', settingsError.message);
        }

        // Check sufficient balance (real balance + spend-capped bonus balance)
        const walletDebit = computeWalletDebit({ homeowner: user, amountDue: completionAmount, capPercent: bonusSpendCapPercent });
        if (!walletDebit.sufficient) {
            return NextResponse.json({
                success: false,
                message: `Insufficient wallet balance. You need ₹${completionAmount} to complete this payment.`,
                required: completionAmount,
                available: userBalance + userBonusBalance,
                shortfall: completionAmount - (userBalance + userBonusBalance)
            }, { status: 400 });
        }

        // Use MongoDB transaction for atomic payment
        const session = await Homeowner.startSession();
        session.startTransaction();

        try {
            const userBalanceBefore = userBalance;
            const userBalanceAfter = userBalance - walletDebit.realToUse;
            const providerBalanceBefore = provider.wallet?.balance || 0;
            const providerBalanceAfter = providerBalanceBefore + completionAmount;

            // Deduct from user wallet - split between bonusBalance (capped) and real balance
            user.wallet.balance = userBalanceAfter;
            user.wallet.bonusBalance = userBonusBalance - walletDebit.bonusToUse;
            await user.save({ session });

            // Initialize provider wallet if not exists
            if (!provider.wallet) {
                provider.wallet = { balance: 0, currency: 'INR' };
            }

            // Add to provider wallet
            provider.wallet.balance = providerBalanceAfter;
            await provider.save({ session });

            // Update booking payment stage - NOW mark as fully completed
            booking.status = 'completed';  // Mark booking as completed after payment
            booking.walletPaymentStage = 'completed';
            booking.paymentStatus = 'paid';
            booking.escrowDetails.completionPaidAt = new Date();
            booking.escrowDetails.isCompletionPaid = true;  // Mark completion payment as done
            booking.escrowDetails.completionBonusUsed = walletDebit.bonusToUse;
            await booking.save({ session });

            // Create user debit transaction
            await Transaction.create([{
                bookingId: booking._id,
                customerId: userId,
                type: 'completion_payment',
                amount: completionAmount,
                balanceBefore: userBalanceBefore,
                balanceAfter: userBalanceAfter,
                walletBreakdown: { bonusUsed: walletDebit.bonusToUse, realUsed: walletDebit.realToUse },
                paymentStage: 'completion_75',
                description: `75% completion payment for ${booking.serviceName}`,
                status: 'completed',
                paymentMethod: 'wallet',
                currency: 'INR',
                serviceName: booking.serviceName,
                serviceCategory: booking.serviceCategory
            }], { session });

            // Create provider credit transaction
            await Transaction.create([{
                bookingId: booking._id,
                providerId: booking.assignedProvider,
                type: 'wallet_credit',
                amount: completionAmount,
                balanceBefore: providerBalanceBefore,
                balanceAfter: providerBalanceAfter,
                paymentStage: 'completion_75',
                description: `75% completion payment received for ${booking.serviceName}`,
                status: 'completed',
                paymentMethod: 'wallet',
                currency: 'INR',
                serviceName: booking.serviceName,
                serviceCategory: booking.serviceCategory
            }], { session });

            // Commit the transaction
            await session.commitTransaction();

            console.log(`✅ Completion payment successful:`);
            console.log(`   ₹${completionAmount} transferred from ${user.name} to ${provider.name}`);

        } catch (paymentError) {
            await session.abortTransaction();
            console.error('❌ Completion payment failed, rolled back:', paymentError.message);
            throw new Error(`Payment failed: ${paymentError.message}`);
        } finally {
            session.endSession();
        }

        // Delete payment_required notifications (prevents modal from reappearing)
        try {
            const deletedCount = await Notification.deleteMany({
                type: { $in: ['payment_required', 'completion_payment_required'] },
                'recipients.userId': user._id,
                'metadata.bookingId': { $in: [booking._id.toString(), booking._id] }
            });
            console.log(`🗑️ Deleted ${deletedCount.deletedCount} payment notifications for booking ${booking._id}`);

            if (deletedCount.deletedCount === 0) {
                console.warn('⚠️ No notifications were deleted. Checking what exists...');
                const existingNotifs = await Notification.find({
                    type: { $in: ['payment_required', 'completion_payment_required'] },
                    'recipients.userId': user._id
                }).select('metadata type');
                console.warn('   Existing payment notifications:', existingNotifs.map(n => ({ type: n.type, bookingId: n.metadata?.bookingId })));
            }
        } catch (deleteError) {
            console.error('Failed to delete payment notifications:', deleteError);
        }

        // Send notifications (outside transaction)
        try {
            // Notify provider
            await createAndSendNotification({
                title: '💰 Payment Received!',
                message: `You received ₹${completionAmount} for completing ${booking.serviceName}. Total booking amount received.`,
                recipientId: provider._id.toString(),
                recipientType: 'provider',
                pushToken: provider.pushToken,
                type: 'payment_received',
                data: {
                    type: 'payment_received',
                    bookingId: booking._id.toString(),
                    amount: completionAmount
                },
                bookingId: booking._id.toString()
            });

            // Notify member
            await createAndSendNotification({
                title: '✅ Payment Completed!',
                message: `₹${completionAmount} has been paid to ${provider.name} for ${booking.serviceName}. Thank you for using our service!`,
                recipientId: user._id.toString(),
                recipientType: 'homeowner',
                pushToken: user.pushToken,
                type: 'payment_completed',
                data: {
                    type: 'payment_completed',
                    bookingId: booking._id.toString(),
                    amount: completionAmount
                },
                bookingId: booking._id.toString()
            });
        } catch (notifError) {
            console.error('Failed to send notification:', notifError);
        }

        return NextResponse.json({
            success: true,
            message: 'Completion payment successful! Full booking amount has been paid.',
            payment: {
                amount: completionAmount,
                newBalance: user.wallet.balance,
                bookingId: booking._id,
                serviceName: booking.serviceName,
                totalPaid: booking.totalPrice
            }
        });

    } catch (error) {
        console.error('❌ Completion payment error:', {
            message: error.message,
            stack: error.stack
        });
        return NextResponse.json({
            success: false,
            message: error.message || 'Payment failed'
        }, { status: 500 });
    }
}
