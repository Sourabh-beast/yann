import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Homeowner from '@/models/Homeowner';
import ServiceProvider from '@/models/ServiceProvider';
import Booking from '@/models/Booking';
import Transaction from '@/models/Transaction';
import Notification from '@/models/Notification';
import { createAndSendNotification } from '@/lib/notificationHelper';

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

        // Validate booking status
        if (booking.status !== 'completed') {
            return NextResponse.json(
                { success: false, message: 'Job must be completed before final payment' },
                { status: 400 }
            );
        }

        // Validate payment stage
        if (booking.walletPaymentStage !== 'initial_25_released') {
            if (booking.walletPaymentStage === 'completed') {
                return NextResponse.json(
                    { success: false, message: 'Payment already completed for this booking' },
                    { status: 400 }
                );
            }
            return NextResponse.json(
                { success: false, message: 'Invalid payment stage. Initial payment must be released first.' },
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

        console.log('💳 Completion payment request:');
        console.log(`   User balance: ₹${userBalance}`);
        console.log(`   Completion amount (75%): ₹${completionAmount}`);

        // Check sufficient balance
        if (userBalance < completionAmount) {
            return NextResponse.json({
                success: false,
                message: `Insufficient wallet balance. You need ₹${completionAmount} to complete this payment.`,
                required: completionAmount,
                available: userBalance,
                shortfall: completionAmount - userBalance
            }, { status: 400 });
        }

        // Use MongoDB transaction for atomic payment
        const session = await Homeowner.startSession();
        session.startTransaction();

        try {
            const userBalanceBefore = userBalance;
            const userBalanceAfter = userBalance - completionAmount;
            const providerBalanceBefore = provider.wallet?.balance || 0;
            const providerBalanceAfter = providerBalanceBefore + completionAmount;

            // Deduct from user wallet
            user.wallet.balance = userBalanceAfter;
            await user.save({ session });

            // Initialize provider wallet if not exists
            if (!provider.wallet) {
                provider.wallet = { balance: 0, currency: 'INR' };
            }

            // Add to provider wallet
            provider.wallet.balance = providerBalanceAfter;
            await provider.save({ session });

            // Update booking payment stage
            booking.walletPaymentStage = 'completed';
            booking.paymentStatus = 'paid';
            booking.escrowDetails.completionPaidAt = new Date();
            await booking.save({ session });

            // Create user debit transaction
            await Transaction.create([{
                bookingId: booking._id,
                customerId: userId,
                type: 'completion_payment',
                amount: completionAmount,
                balanceBefore: userBalanceBefore,
                balanceAfter: userBalanceAfter,
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

        // Delete payment_required notification (prevents modal from reappearing)
        try {
            const deletedCount = await Notification.deleteMany({
                type: 'payment_required',
                'recipients.userId': user._id,
                'metadata.bookingId': { $in: [booking._id.toString(), booking._id] }
            });
            console.log(`🗑️ Deleted ${deletedCount.deletedCount} payment_required notifications for booking ${booking._id}`);
            
            if (deletedCount.deletedCount === 0) {
                console.warn('⚠️ No notifications were deleted. Checking what exists...');
                const existingNotifs = await Notification.find({
                    type: 'payment_required',
                    'recipients.userId': user._id
                }).select('metadata');
                console.warn('   Existing payment notifications:', existingNotifs.map(n => n.metadata?.bookingId));
            }
        } catch (deleteError) {
            console.error('Failed to delete payment_required notification:', deleteError);
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
                newBalance: user.wallet.balance - completionAmount,
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
