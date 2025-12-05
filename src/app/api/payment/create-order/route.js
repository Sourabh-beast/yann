import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      orderId, 
      orderAmount, 
      customerName, 
      customerEmail, 
      customerPhone,
      bookingId 
    } = body;

    // Validate required fields
    if (!orderId || !orderAmount || !customerPhone) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const orderRequest = {
      order_id: orderId,
      order_amount: orderAmount,
      order_currency: 'INR',
      customer_details: {
        customer_id: `cust_${Date.now()}`,
        customer_name: customerName || 'Customer',
        customer_email: customerEmail || 'customer@yann.in',
        customer_phone: customerPhone,
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/status?order_id={order_id}`,
        notify_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payment/webhook`,
      },
      order_note: bookingId ? `Booking ID: ${bookingId}` : 'YANN Service Booking',
    };

    // Create order using Cashfree API
    const response = await fetch('https://api.cashfree.com/pg/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': process.env.CASHFREE_APP_ID,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY,
        'x-api-version': '2023-08-01',
      },
      body: JSON.stringify(orderRequest),
    });

    const data = await response.json();

    if (response.ok && data.payment_session_id) {
      return NextResponse.json({
        success: true,
        order_id: data.order_id,
        payment_session_id: data.payment_session_id,
        order_status: data.order_status,
        cf_order_id: data.cf_order_id,
      });
    }

    console.error('Cashfree order creation failed:', data);
    return NextResponse.json(
      { success: false, message: data.message || 'Failed to create order' },
      { status: 500 }
    );

  } catch (error) {
    console.error('Cashfree create order error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Payment order creation failed' },
      { status: 500 }
    );
  }
}
