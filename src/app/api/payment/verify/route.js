import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID required' },
        { status: 400 }
      );
    }

    // Determine environment
    const isSandbox = process.env.CASHFREE_ENV === 'sandbox';
    const baseUrl = isSandbox 
      ? 'https://sandbox.cashfree.com/pg' 
      : 'https://api.cashfree.com/pg';

    // Fetch order status from Cashfree
    const response = await fetch(`${baseUrl}/orders/${orderId}/payments`, {
      method: 'GET',
      headers: {
        'x-client-id': process.env.CASHFREE_APP_ID,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY,
        'x-api-version': '2023-08-01',
      },
    });

    const payments = await response.json();

    if (response.ok && Array.isArray(payments) && payments.length > 0) {
      const payment = payments[0];
      
      return NextResponse.json({
        success: true,
        status: payment.payment_status,
        paymentId: payment.cf_payment_id,
        paymentMethod: payment.payment_method?.upi?.channel || 
                       payment.payment_method?.card?.card_network ||
                       payment.payment_group || 'other',
        amount: payment.payment_amount,
        paymentTime: payment.payment_completion_time,
      });
    }

    // If no payments found, check order status
    const orderResponse = await fetch(`${baseUrl}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'x-client-id': process.env.CASHFREE_APP_ID,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY,
        'x-api-version': '2023-08-01',
      },
    });

    const orderData = await orderResponse.json();

    return NextResponse.json({
      success: true,
      status: orderData.order_status === 'PAID' ? 'SUCCESS' : orderData.order_status,
      orderStatus: orderData.order_status,
      amount: orderData.order_amount,
    });

  } catch (error) {
    console.error('Cashfree verify error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
