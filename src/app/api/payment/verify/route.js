import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    console.log('🔐 Payment verification request:', {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id ? razorpay_payment_id.substring(0, 15) + '...' : 'missing',
      hasSignature: !!razorpay_signature,
    });

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error('❌ Missing payment verification details');
      return NextResponse.json(
        { success: false, message: 'Missing payment verification details' },
        { status: 400 }
      );
    }

    // Check if Razorpay secret is configured
    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error('Missing Razorpay secret key');
      return NextResponse.json(
        { success: false, message: 'Payment gateway not configured' },
        { status: 500 }
      );
    }

    // Verify the payment signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    const isAuthentic = expectedSign === razorpay_signature;

    if (isAuthentic) {
      console.log('✅ Payment verified successfully:', { 
        orderId: razorpay_order_id, 
        paymentId: razorpay_payment_id 
      });

      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        status: 'SUCCESS',
      });
    } else {
      console.error('❌ Payment verification failed - signature mismatch', {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });
      return NextResponse.json(
        { 
          success: false, 
          message: 'Payment verification failed - Invalid signature',
          status: 'FAILED' 
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('❌ Razorpay verify error:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { success: false, message: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}

// GET endpoint to check order status (optional - for polling)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required' },
        { status: 400 }
      );
    }

    // For GET requests, we just acknowledge the order ID
    // Actual status should be verified via POST with signature
    return NextResponse.json({
      success: true,
      orderId,
      message: 'Use POST with signature for verification',
    });

  } catch (error) {
    console.error('Razorpay status check error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
