import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Booking from '@/models/Booking';
import Homeowner from '@/models/Homeowner';
import ServiceProvider from '@/models/ServiceProvider';
import Transaction from '@/models/Transaction';
import { createAndSendNotification } from '@/lib/notificationHelper';

/**
 * POST /api/bookings/pay-initial
 * Process 25% initial payment after provider accepts booking
 * 
 * Request body:
 * {
 *   bookingId: string,
 *   paymentMethod: 'wallet' | 'razorpay'
 * }
 */
export async function POST(req) {
    try {
        await connectDB();

        const body = await req.json();
        const bookingId = body.bookingId;
        const paymentMethod = body.paymentMethod || 'wallet'; // Default to wallet

        // Validate required fields
        if (!bookingId) {
            return NextResponse.json(
                { success: false, message: 'Booking ID is required' },
                { status: 400 }
            );
        }

        console.log(`💰 Processing initial payment for booking ${bookingId} via ${paymentMethod}`);

        // Find the booking
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return NextResponse.json(
                { success: false, message: 'Booking not found' },
                { status: 404 }
            );
        }

        // Verify booking is in correct state for payment
        if (booking.status !== 'pending_payment') {
            return NextResponse.json(
                { success: false, message: `Cannot process payment for booking with status: ${booking.status}` },
                { status: 400 }
            );
        }

        // Check if payment timer expired
        const now = new Date();
        if (booking.paymentTimer?.expiresAt && new Date(booking.paymentTimer.expiresAt) < now) {
            // Auto-cancel expired booking
            booking.status = 'cancelled';
            booking.paymentTimer.timedOut = true;
            await booking.save();

            return NextResponse.json(
                { success: false, message: 'Payment window expired. Booking has been cancelled.' },
                { status: 400 }
            );
        }

        // Calculate 25% initial payment
        const totalPrice = booking.totalPrice || 0;
        const initialAmount = Math.round(totalPrice * 0.25 * 100) / 100; // 25%
        const completionAmount = Math.round((totalPrice - initialAmount) * 100) / 100; // 75%

        // Process wallet payment
        if (paymentMethod === 'wallet') {
            // Find customer
            const customer = await Homeowner.findById(booking.customerId);
            if (!customer) {
                return NextResponse.json(
                    { success: false, message: 'Customer not found' },
                    { status: 404 }
                );
            }

            // Check wallet balance
            const walletBalance = customer.wallet?.balance || 0;
            if (walletBalance < initialAmount) {
                return NextResponse.json(
                    {
                        success: false,
                        message: `Insufficient wallet balance. Required: ₹${initialAmount}, Available: ₹${walletBalance}`
                    },
                    { status: 400 }
                );
            }

            // Deduct from customer wallet
            customer.wallet.balance -= initialAmount;

            // Add transaction to customer's wallet history
            if (!customer.wallet.transactions) {
                customer.wallet.transactions = [];
            }
            customer.wallet.transactions.push({
                type: 'debit',
                amount: initialAmount,
                description: `Initial payment (25%) for ${booking.serviceName}`,
                bookingId: booking._id,
                date: new Date(),
                status: 'completed'
            });

            await customer.save();

            // Find provider and add to their wallet
            const provider = await ServiceProvider.findById(booking.assignedProvider);
            if (!provider) {
                return NextResponse.json(
                    { success: false, message: 'Provider not found' },
                    { status: 404 }
                );
            }

            // Add to provider wallet (held in escrow)
            provider.wallet.balance += initialAmount;

            // Add transaction to provider's wallet history
            if (!provider.wallet.transactions) {
                provider.wallet.transactions = [];
            }
            provider.wallet.transactions.push({
                type: 'credit',
                amount: initialAmount,
                description: `Initial payment (25%) for ${booking.serviceName} (held in escrow)`,
                bookingId: booking._id,
                date: new Date(),
                status: 'held_in_escrow'
            });

            await provider.save();

            // Update booking with escrow details
            booking.escrowDetails = {
                initialPayment: initialAmount,
                completionAmount: completionAmount,
                isInitialPaid: true,
                isCompletionPaid: false,
                totalHeldInEscrow: initialAmount,
                initialPaidAt: new Date(),
                initialReleasedAt: null,
                completionPaidAt: null
            };

            booking.walletPaymentStage = 'initial_25_held';
            booking.paymentStatus = 'partial';
            booking.paymentMethod = 'wallet';
            booking.status = 'accepted';
            booking.paymentTimer.paidAt = new Date();

            await booking.save();

            // Record transaction
            await Transaction.create({
                type: 'booking_initial_payment',
                amount: initialAmount,
                homeowner: customer._id,
                provider: provider._id,
                booking: booking._id,
                status: 'held_in_escrow',
                description: `Initial payment (25%) for ${booking.serviceName}`,
                metadata: {
                    bookingId: booking._id.toString(),
                    serviceName: booking.serviceName,
                    paymentPhase: 'initial',
                    percentage: 25
                }
            });

            // Notify provider that booking is confirmed
            if (provider?.pushToken) {
                await createAndSendNotification({
                    title: '💰 Payment Received!',
                    message: `${customer.name} paid ₹${initialAmount}. ${booking.serviceName} booking confirmed.`,
                    recipientId: provider._id.toString(),
                    recipientType: 'provider',
                    pushToken: provider.pushToken,
                    type: 'booking_confirmed',
                    data: {
                        recipientId: provider._id.toString(),
                        bookingId: booking._id.toString(),
                        amount: initialAmount
                    },
                    bookingId: booking._id.toString()
                });
            }

            console.log(`✅ Initial payment completed: ₹${initialAmount} for booking ${bookingId}`);

            return NextResponse.json({
                success: true,
                message: 'Initial payment processed successfully',
                data: {
                    booking: {
                        _id: booking._id,
                        status: booking.status,
                        paymentStatus: booking.paymentStatus,
                        walletPaymentStage: booking.walletPaymentStage,
                        escrowDetails: booking.escrowDetails
                    },
                    payment: {
                        initialAmount,
                        completionAmount,
                        totalPrice,
                        remainingBalance: customer.wallet.balance
                    }
                }
            });
        }

        // Razorpay payment (future implementation)
        if (paymentMethod === 'razorpay') {
            return NextResponse.json(
                { success: false, message: 'Razorpay payment not yet implemented for staged payments' },
                { status: 501 }
            );
        }

        return NextResponse.json(
            { success: false, message: 'Invalid payment method' },
            { status: 400 }
        );

    } catch (error) {
        console.error('❌ Pay initial error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to process payment' },
            { status: 500 }
        );
    }
}
