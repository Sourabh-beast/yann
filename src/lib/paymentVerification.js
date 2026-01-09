/**
 * Razorpay Payment Verification
 * 
 * Verifies payment signatures to prevent fake payment confirmations
 */

import crypto from 'crypto';

/**
 * Verify Razorpay payment signature
 * @param {Object} params - Payment parameters
 * @param {string} params.orderId - Razorpay order ID
 * @param {string} params.paymentId - Razorpay payment ID
 * @param {string} params.signature - Razorpay signature
 * @returns {boolean} True if signature is valid
 */
export function verifyRazorpaySignature({ orderId, paymentId, signature }) {
    if (!process.env.RAZORPAY_KEY_SECRET) {
        throw new Error('RAZORPAY_KEY_SECRET not configured');
    }

    // Create expected signature
    const text = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');

    // Compare signatures securely
    return crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(signature)
    );
}

/**
 * Verify Razorpay webhook signature
 * @param {string} webhookBody - Raw webhook body
 * @param {string} signature - X-Razorpay-Signature header
 * @returns {boolean} True if signature is valid
 */
export function verifyRazorpayWebhook(webhookBody, signature) {
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
        throw new Error('RAZORPAY_WEBHOOK_SECRET not configured');
    }

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(webhookBody)
        .digest('hex');

    return crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(signature)
    );
}

/**
 * Validate payment amount matches order amount
 * @param {number} paidAmount - Amount paid (in paise)
 * @param {number} orderAmount - Expected amount (in paise)
 * @param {number} tolerance - Allowed difference (default 0)
 * @returns {boolean} True if amounts match within tolerance
 */
export function validatePaymentAmount(paidAmount, orderAmount, tolerance = 0) {
    const difference = Math.abs(paidAmount - orderAmount);
    return difference <= tolerance;
}
