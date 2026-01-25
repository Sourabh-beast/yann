import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Homeowner from '@/models/Homeowner';

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
export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        const { bookingId, paymentMethod } = await req.json();

        // Validate required fields
        if (!bookingId) {
            return NextResponse.json(
                { success: false, message: 'Booking ID is required' },
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

        // Verify booking is in correct state for payment
        if (booking.status !== 'pending_payment' && booking.status !== 'accepted') {
            return NextResponse.json(
                { success: false, message: `Cannot process payment for booking with status: ${booking.status}` },
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

            // Update booking with escrow details
            booking.escrowDetails = {
                initialAmount,
                completionAmount,
                initialPaidAt: new Date(),
                initialReleasedAt: null,
                initialRefundedAt: null,
                completionPaidAt: null
            };

            booking.walletPaymentStage = 'initial_25_held';
            booking.paymentStatus = 'partial';
            booking.paymentMethod = 'wallet';
            booking.status = 'accepted';

            await booking.save();

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

    } catch (error: any) {
        console.error('❌ Pay initial error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to process payment' },
            { status: 500 }
        );
    }
}
