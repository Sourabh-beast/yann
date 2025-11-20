import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Booking from '@/models/Booking';
import ServiceProvider from '@/models/ServiceProvider';

export async function POST(request) {
  try {
    await connectDB();

    const bookingData = await request.json();

    // Validate required fields
    const requiredFields = ['serviceId', 'serviceName', 'serviceCategory', 'customerPhone', 'customerAddress', 'bookingDate', 'bookingTime', 'basePrice', 'totalPrice'];
    
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        return NextResponse.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Create new booking
    const booking = await Booking.create({
      serviceId: bookingData.serviceId,
      serviceName: bookingData.serviceName,
      serviceCategory: bookingData.serviceCategory,
      customerId: bookingData.customerId || null,
      customerName: bookingData.customerName || 'Guest',
      customerPhone: bookingData.customerPhone,
      customerAddress: bookingData.customerAddress,
      bookingDate: new Date(bookingData.bookingDate),
      bookingTime: bookingData.bookingTime,
      basePrice: bookingData.basePrice,
      extras: bookingData.extras || [],
      totalPrice: bookingData.totalPrice,
      paymentMethod: bookingData.paymentMethod || 'cash',
      billingType: bookingData.billingType || 'one-time',
      quantity: bookingData.quantity || 1,
      notes: bookingData.notes || '',
      status: 'pending'
    });

    // Find all service providers who offer this service
    const serviceName = bookingData.serviceName;
    const availableProviders = await ServiceProvider.find({
      services: serviceName,
      status: 'active'
    }).select('_id name email phone services');

    // Store notification info (in real app, send emails/SMS here)
    console.log(`📢 Booking created! Notifying ${availableProviders.length} providers for ${serviceName}`);
    
    // In production, you would:
    // - Send email notifications to all providers
    // - Send SMS notifications
    // - Create push notifications
    // - Use Socket.io for real-time updates

    return NextResponse.json({
      success: true,
      message: 'Booking created successfully! Service providers will be notified.',
      booking: {
        id: booking._id,
        serviceName: booking.serviceName,
        bookingDate: booking.formattedDate,
        bookingTime: booking.bookingTime,
        totalPrice: booking.totalPrice,
        status: booking.status
      },
      notifiedProviders: availableProviders.length
    }, { status: 201 });

  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create booking',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
