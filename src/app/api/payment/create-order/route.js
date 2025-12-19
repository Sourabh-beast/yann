import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, customerName, customerPhone, customerEmail, serviceName, bookingId } = body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Valid amount is required' },
        { status: 400 }
      );
    }

    // Check if Razorpay keys are configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Missing Razorpay API keys');
      return NextResponse.json(
        { success: false, message: 'Payment gateway not configured' },
        { status: 500 }
      );
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `YANN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      notes: {
        serviceName: serviceName || 'Service Booking',
        customerName: customerName || 'Guest',
        customerPhone: customerPhone || '',
        bookingId: bookingId || '',
      },
    };

    const order = await razorpay.orders.create(options);

    console.log('Razorpay order created:', { orderId: order.id, amount: order.amount });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID, // Send key_id for frontend
      customerName,
      customerPhone,
      customerEmail,
    });

  } catch (error) {
    console.error('Razorpay create order error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
