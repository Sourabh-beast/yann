import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, customerPhone, customerName, serviceName } = body;
    
    console.log('UPI API called with:', { amount, customerPhone, customerName, serviceName });

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid amount required' },
        { status: 400 }
      );
    }

    // Check if API keys are present
    if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
      console.error('Missing Cashfree API keys');
      return NextResponse.json(
        { success: false, error: 'Payment gateway not configured' },
        { status: 500 }
      );
    }

    // Determine environment
    const isSandbox = process.env.CASHFREE_ENV === 'sandbox';
    const baseUrl = isSandbox 
      ? 'https://sandbox.cashfree.com/pg' 
      : 'https://api.cashfree.com/pg';

    // Generate unique order ID
    const orderId = `YANN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Validate and format phone number (must be 10 digits)
    let validPhone = (customerPhone || '').replace(/\D/g, '');
    if (validPhone.length !== 10) {
      validPhone = '9999999999'; // Fallback for invalid phone
    }

    // Build return URL - only include if HTTPS (required by Cashfree production)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const orderMeta = {};
    if (appUrl.startsWith('https://')) {
      orderMeta.return_url = `${appUrl}/payment/status?order_id=${orderId}`;
    }

    // Create order with payment link
    const orderPayload = {
      order_id: orderId,
      order_amount: parseFloat(amount),
      order_currency: 'INR',
      customer_details: {
        customer_id: `CUST_${Date.now()}`,
        customer_phone: validPhone,
        customer_name: customerName || 'Guest',
      },
      order_note: serviceName || 'Service Booking',
    };

    // Only add order_meta if it has content
    if (Object.keys(orderMeta).length > 0) {
      orderPayload.order_meta = orderMeta;
    }

    console.log('Creating order:', { baseUrl, orderId, orderPayload });

    const orderResponse = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': process.env.CASHFREE_APP_ID,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY,
        'x-api-version': '2023-08-01',
      },
      body: JSON.stringify(orderPayload),
    });

    const orderData = await orderResponse.json();
    console.log('Cashfree response:', { status: orderResponse.status, data: orderData });

    if (!orderResponse.ok) {
      console.error('Order creation failed:', orderData);
      return NextResponse.json(
        { success: false, error: orderData.message || orderData.type || JSON.stringify(orderData) },
        { status: 500 }
      );
    }

    // Use the payment_link from Cashfree response directly if available
    // Otherwise construct it from payment_session_id
    let paymentLink = orderData.payment_link;
    if (!paymentLink && orderData.payment_session_id) {
      // Correct Cashfree payment link format
      paymentLink = `https://payments${isSandbox ? '.sandbox' : ''}.cashfree.com/pg/orders/${orderId}/pay?payment_session_id=${orderData.payment_session_id}`;
    }
    
    // Generate QR code using a free QR code API
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(paymentLink)}`;

    console.log('Payment created successfully:', { orderId, paymentLink, qrCodeUrl, payment_session_id: orderData.payment_session_id });

    return NextResponse.json({
      success: true,
      orderId: orderId,
      paymentSessionId: orderData.payment_session_id,
      qrCode: qrCodeUrl,
      paymentLink: paymentLink,
      upiLink: '',
    });

  } catch (error) {
    console.error('UPI payment error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
