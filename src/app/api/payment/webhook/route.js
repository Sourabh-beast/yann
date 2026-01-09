import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/connectDB';
import Booking from '@/models/Booking';
import Transaction from '@/models/Transaction';
import { verifyRazorpayWebhook } from '@/lib/paymentVerification';
import { logError } from '@/lib/errorHandler';

// Razorpay webhook IPs (add actual IPs from Razorpay documentation)
const RAZORPAY_IPS = [
    '13.232.150.88',
    '13.233.104.105',
    '52.66.193.64',
    // Add more Razorpay IPs as needed
];

/**
 * POST /api/payment/webhook
 * Handle Razorpay payment webhooks
 * SECURITY: IP whitelist + signature verification
 */
export async function POST(request) {
    try {
        // SECURITY: Check IP whitelist
        const clientIp = getClientIp(request);
        if (process.env.NODE_ENV === 'production' && !RAZORPAY_IPS.includes(clientIp)) {
            logError(new Error('Unauthorized webhook IP'), { ip: clientIp });
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Get raw body for signature verification
        const rawBody = await request.text();
        const signature = request.headers.get('x-razorpay-signature');

        if (!signature) {
            return NextResponse.json(
                { success: false, message: 'Missing signature' },
                { status: 400 }
            );
        }

        // SECURITY: Verify webhook signature
        const isValid = verifyRazorpayWebhook(rawBody, signature);
        if (!isValid) {
            logError(new Error('Invalid webhook signature'), { ip: clientIp });
            return NextResponse.json(
                { success: false, message: 'Invalid signature' },
                { status: 400 }
            );
        }

        // Parse webhook data
        const webhookData = JSON.parse(rawBody);
        const event = webhookData.event;
        const payload = webhookData.payload?.payment?.entity || webhookData.payload?.order?.entity;

        if (!payload) {
            return NextResponse.json(
                { success: false, message: 'Invalid payload' },
                { status: 400 }
            );
        }

        await connectDB();

        // Handle different webhook events
        switch (event) {
            case 'payment.captured':
                await handlePaymentCaptured(payload);
                break;

            case 'payment.failed':
                await handlePaymentFailed(payload);
                break;

            case 'order.paid':
                await handleOrderPaid(payload);
                break;

            default:
                console.log('Unhandled webhook event:', event);
        }

        return NextResponse.json({ success: true, message: 'Webhook processed' });
    } catch (error) {
        logError(error, { endpoint: '/api/payment/webhook' });
        return NextResponse.json(
            { success: false, message: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

/**
 * Handle payment captured event
 */
async function handlePaymentCaptured(payment) {
    const orderId = payment.order_id;
    const paymentId = payment.id;
    const amount = payment.amount / 100; // Convert paise to rupees

    // Find booking by order ID
    const booking = await Booking.findOne({ razorpayOrderId: orderId });

    if (!booking) {
        console.warn('Booking not found for order:', orderId);
        return;
    }

    // Idempotency check
    if (booking.paymentStatus === 'paid' && booking.razorpayPaymentId === paymentId) {
        console.log('Payment already processed:', paymentId);
        return;
    }

    // Update booking
    booking.paymentStatus = 'paid';
    booking.razorpayPaymentId = paymentId;
    await booking.save();

    // Create transaction record
    await Transaction.create({
        bookingId: booking._id,
        customerId: booking.customerId,
        providerId: booking.assignedProvider,
        type: 'payment',
        amount,
        description: `Payment captured for booking #${booking._id}`,
        status: 'completed',
        paymentMethod: 'online',
        currency: 'INR',
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
    });

    console.log('✅ Payment captured:', paymentId);
}

/**
 * Handle payment failed event
 */
async function handlePaymentFailed(payment) {
    const orderId = payment.order_id;
    const paymentId = payment.id;

    const booking = await Booking.findOne({ razorpayOrderId: orderId });

    if (booking) {
        booking.paymentStatus = 'failed';
        await booking.save();
    }

    console.log('❌ Payment failed:', paymentId);
}

/**
 * Handle order paid event
 */
async function handleOrderPaid(order) {
    console.log('✅ Order paid:', order.id);
}

/**
 * Get client IP from request
 */
function getClientIp(request) {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
        return realIp;
    }

    return 'unknown';
}
