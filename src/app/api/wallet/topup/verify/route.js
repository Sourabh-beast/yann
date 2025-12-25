import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Homeowner from '@/models/Homeowner';
import Transaction from '@/models/Transaction';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import crypto from 'crypto';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
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

    await dbConnect();

    // Fetch order details from Razorpay to get amount
    const order = await razorpay.orders.fetch(razorpay_order_id);
    const amountToAdd = order.amount / 100; // Convert from paise to rupees

    // Update user wallet
    const user = await Homeowner.findById(session.user.id);
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
      customerId: session.user.id,
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
