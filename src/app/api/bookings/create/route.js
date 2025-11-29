import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Booking from '@/models/Booking';
import ServiceProvider from '@/models/ServiceProvider';
import ResidentRequest from '@/models/ResidentRequest';

export async function POST(request) {
  try {
    await connectDB();

    const bookingData = await request.json();

    // Validate required fields
    const requiredFields = ['serviceId', 'serviceName', 'serviceCategory', 'customerPhone', 'customerAddress', 'bookingDate', 'bookingTime', 'providerId'];
    
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        return NextResponse.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Resolve provider pricing
    const provider = await ServiceProvider.findById(bookingData.providerId);
    if (!provider || provider.status !== 'active') {
      return NextResponse.json(
        { success: false, message: 'Selected service partner is no longer available' },
        { status: 400 }
      );
    }

    const providerPrice = typeof provider.getPriceForService === 'function'
      ? provider.getPriceForService(bookingData.serviceName)
      : provider.serviceRates?.find(rate => rate.serviceName === bookingData.serviceName)?.price;

    if (providerPrice === undefined || providerPrice === null) {
      return NextResponse.json(
        { success: false, message: 'Selected partner has not set a price for this service' },
        { status: 400 }
      );
    }

    bookingData.basePrice = providerPrice;

    const extras = Array.isArray(bookingData.extras) ? bookingData.extras : [];
    const extrasTotal = extras.reduce((sum, extra) => sum + (extra?.price || 0), 0);

    let driverDetails = null;

    if (bookingData.serviceCategory === 'driver') {
      const driverPayload = bookingData.driverDetails || {};
      const parseToMinutes = (value) => {
        if (!value || typeof value !== 'string' || !value.includes(':')) return null;
        const [hours, minutes] = value.split(':').map(Number);
        if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
        return hours * 60 + minutes;
      };

      const startMinutes = parseToMinutes(driverPayload.startTime || bookingData.bookingTime);
      const endMinutes = parseToMinutes(driverPayload.endTime || driverPayload.startTime);

      if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
        return NextResponse.json(
          { success: false, message: 'Valid driver start and end time are required' },
          { status: 400 }
        );
      }

      const totalMinutes = endMinutes - startMinutes;
      const totalHours = totalMinutes / 60;
      const baseHours = driverPayload.baseHours || 10;
      const hourlyRate = driverPayload.hourlyRate || (bookingData.basePrice / baseHours);
      const overtimeMultiplier = driverPayload.overtimeMultiplier || 2;
      const overtimeHours = Math.max(0, totalHours - baseHours);
      const billableBaseHours = Math.min(totalHours, baseHours);
      const baseCost = billableBaseHours * hourlyRate;
      const overtimeRate = hourlyRate * overtimeMultiplier;
      const overtimeCost = overtimeHours * overtimeRate;

      const resolvedStartTime = driverPayload.startTime || bookingData.bookingTime;
      const resolvedEndTime = driverPayload.endTime || driverPayload.startTime;

      driverDetails = {
        startTime: resolvedStartTime,
        endTime: resolvedEndTime,
        totalHours: Number(totalHours.toFixed(2)),
        baseHours,
        hourlyRate,
        overtimeHours: Number(overtimeHours.toFixed(2)),
        overtimeRate,
        overtimeMultiplier,
        baseCost,
        overtimeCost
      };

      bookingData.bookingTime = resolvedStartTime;
      bookingData.totalPrice = Number((baseCost + overtimeCost + extrasTotal).toFixed(2));
    } else {
      const quantity = Number(bookingData.quantity) || 1;
      const billingType = bookingData.billingType || 'one-time';
      const billingMultiplier = billingType === 'monthly' ? 4 : 1;
      bookingData.totalPrice = (bookingData.basePrice + extrasTotal) * billingMultiplier * quantity;
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
      extras,
      totalPrice: bookingData.totalPrice,
      paymentMethod: bookingData.paymentMethod || 'cash',
      billingType: bookingData.billingType || 'one-time',
      quantity: bookingData.quantity || 1,
      notes: bookingData.notes || '',
      status: 'pending',
      driverDetails,
      assignedProvider: provider._id,
      providerName: provider.name
    });

    let residentRequest = null;
    if (booking.customerId) {
      residentRequest = await ResidentRequest.create({
        homeowner: booking.customerId,
        title: booking.serviceName,
        serviceType: booking.serviceCategory,
        description: booking.notes || '',
        scheduledFor: booking.bookingDate,
        priority: 'routine',
        locationLabel: booking.customerAddress?.slice(0, 60) || 'Home',
        booking: booking._id,
        status: 'pending'
      });
      booking.residentRequest = residentRequest._id;
      await booking.save();
    }

    // Find all service providers who offer this service
    const serviceName = bookingData.serviceName;
    
    console.log('🔍 Searching for providers with service:', serviceName);
    
    // Find providers whose services array contains this service name (exact match)
    const availableProviders = await ServiceProvider.find({
      services: { $in: [serviceName] }, // Check if serviceName exists in services array
      status: 'active'
    }).select('_id name email phone services');

    console.log(`📢 Booking created! Found ${availableProviders.length} providers for "${serviceName}"`);
    
    if (availableProviders.length > 0) {
      console.log('✅ Providers who will receive this booking:');
      availableProviders.forEach(p => {
        console.log(`   - ${p.name} (${p.email}) - Services: [${p.services.join(', ')}]`);
      });
    } else {
      console.log('⚠️ WARNING: No providers found for this service!');
      console.log('💡 Tip: Make sure providers register with exact service name:', serviceName);
    }
    
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
        status: booking.status,
        providerName: booking.providerName,
        driverDetails: booking.driverDetails
      },
      residentRequestId: residentRequest?._id || null,
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
