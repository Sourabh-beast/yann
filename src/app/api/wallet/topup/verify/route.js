import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Homeowner from '@/models/Homeowner';
import Transaction from '@/models/Transaction';
import crypto from 'crypto';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  try {
    // Extract user ID from request headers (sent by mobile app)
    const userId = req.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 400 });
    }

    await connectDB();

    // Fetch order details from Razorpay to get amount
    const order = await razorpay.orders.fetch(razorpay_order_id);
    const amountToAdd = order.amount / 100; // Convert from paise to rupees

    // Update user wallet
    const user = await Homeowner.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const balanceBefore = user.wallet?.balance || 0;
    const balanceAfter = balanceBefore + amountToAdd;

    user.wallet = {
      balance: balanceAfter,
      currency: 'INR'
    };
    await user.save();

    // Log transaction
    await Transaction.create({
      customerId: userId,
      type: 'wallet_topup',
      amount: amountToAdd,
      balanceBefore,
      balanceAfter,
      description: `Wallet recharged via Razorpay`,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: 'completed',
      paymentMethod: 'razorpay',
      currency: 'INR'
    });

    return NextResponse.json({
      success: true,
      message: 'Wallet recharged successfully',
      newBalance: balanceAfter
    });
  } catch (error) {
    console.error('Wallet verify error:', error);
    return NextResponse.json({ success: false, message: 'Verification failed' }, { status: 500 });
  }
}
