import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Homeowner from '@/models/Homeowner';
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

export async function POST(req) {
  try {
    // Extract user ID from request headers (sent by mobile app)
    const userId = req.headers.get('x-user-id');
    
    console.log('📥 Wallet topup request:', { userId: userId ? 'present' : 'missing' });
    
    if (!userId) {
      console.error('❌ Missing user ID in headers');
      return NextResponse.json({ success: false, message: 'Unauthorized - User ID required' }, { status: 401 });
    }

    const { amount } = await req.json();

    console.log('💰 Topup amount:', amount);

    // Validate amount
    if (!amount || amount < 1) {
      console.error('❌ Invalid amount:', amount);
      return NextResponse.json({ success: false, message: 'Invalid amount - minimum ₹1 required' }, { status: 400 });
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

    await connectDB();

    const user = await Homeowner.findById(userId);
    if (!user) {
      console.error('❌ User not found:', userId);
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    console.log('✅ User found:', user.name);

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
    const orderOptions = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `wallet_topup_${userId}_${Date.now()}`,
      notes: {
        userId: userId,
        type: 'WALLET_TOPUP',
        userName: user.name,
        userEmail: user.email
      }
    };

    console.log('🔄 Creating Razorpay order:', { amount: orderOptions.amount, currency: orderOptions.currency });

    const order = await razorpay.orders.create(orderOptions);

    console.log('✅ Razorpay order created:', { orderId: order.id, amount: order.amount });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('❌ Wallet topup error:', {
      message: error.message,
      description: error.error?.description,
      code: error.error?.code,
      stack: error.stack
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
      { success: false, message: error.message || 'Failed to create wallet topup order' },
      { status: 500 }
    );
  }
}
