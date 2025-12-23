import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

// Lazy initialization function for Razorpay
function getRazorpayInstance() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, customerName, customerPhone, customerEmail, serviceName, bookingId } = body;

    console.log('📥 Create order request:', {
      amount,
      customerName,
      customerPhone: customerPhone ? customerPhone.substring(0, 5) + '...' : 'missing',
      customerEmail: customerEmail || 'missing',
      serviceName,
    });

    // Validate required fields
    if (!amount || amount <= 0) {
      console.error('❌ Invalid amount:', amount);
      return NextResponse.json(
        { success: false, message: 'Valid amount is required' },
        { status: 400 }
      );
    }

    // Validate customer details
    if (!customerPhone || customerPhone.length < 10) {
      console.error('❌ Invalid phone number:', customerPhone);
      return NextResponse.json(
        { success: false, message: 'Valid phone number (10 digits) is required' },
        { status: 400 }
      );
    }

    if (!customerEmail) {
      console.error('❌ Missing customer email');
      return NextResponse.json(
        { success: false, message: 'Customer email is required' },
        { status: 400 }
      );
    }

    // Check if Razorpay keys are configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('❌ Missing Razorpay API keys in environment variables');
      return NextResponse.json(
        { success: false, message: 'Payment gateway not configured' },
        { status: 500 }
      );
    }

    // Validate Razorpay key format
    if (!process.env.RAZORPAY_KEY_ID.startsWith('rzp_')) {
      console.error('❌ Invalid Razorpay Key ID format');
      return NextResponse.json(
        { success: false, message: 'Payment gateway misconfigured' },
        { status: 500 }
      );
    }

    // Get Razorpay instance
    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      console.error('❌ Failed to initialize Razorpay');
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
        customerEmail: customerEmail || '',
        bookingId: bookingId || '',
      },
    };

    console.log('🔄 Creating Razorpay order with amount:', options.amount, 'paise (₹' + amount + ')');

    const order = await razorpay.orders.create(options);

    console.log('✅ Razorpay order created:', { orderId: order.id, amount: order.amount, currency: order.currency });

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
    console.error('❌ Razorpay create order error:', {
      message: error.message,
      description: error.error?.description,
      code: error.error?.code,
    });

    // Handle specific Razorpay errors
    if (error.statusCode) {
      return NextResponse.json(
        { 
          success: false, 
          message: error.error?.description || 'Razorpay API error',
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
