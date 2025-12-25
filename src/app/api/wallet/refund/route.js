import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Homeowner from '@/models/Homeowner';
import Transaction from '@/models/Transaction';

export async function POST(req) {
  try {
    const userId = req.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { amount, reason } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, message: 'Invalid amount' }, { status: 400 });
    }

    await connectDB();

    const user = await Homeowner.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const balanceBefore = user.wallet?.balance || 0;
    const balanceAfter = balanceBefore + amount;

    user.wallet.balance = balanceAfter;
    await user.save();

    // Log refund transaction
    await Transaction.create({
      customerId: userId,
      type: 'refund',
      amount: amount,
      balanceBefore,
      balanceAfter,
      description: reason || 'Manual refund for failed booking',
      status: 'completed',
      paymentMethod: 'wallet',
      currency: 'INR'
    });

    console.log('✅ Refund processed:', { userId, amount, balanceBefore, balanceAfter });

    return NextResponse.json({
      success: true,
      message: 'Refund processed successfully',
      newBalance: balanceAfter
    });
  } catch (error) {
    console.error('Refund error:', error);
    return NextResponse.json({ success: false, message: 'Refund failed' }, { status: 500 });
  }
}
