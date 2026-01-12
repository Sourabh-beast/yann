import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Booking from '@/models/Booking';
import ServiceProvider from '@/models/ServiceProvider';
import ResidentRequest from '@/models/ResidentRequest';
import { createAndSendNotification } from '@/lib/notificationHelper';
import { validateDriverCarType, checkHourlyBillingSupport } from '@/utils/bookingValidator';
import { requireAuth, verifyOwnership } from '@/lib/authMiddleware';
import { validateInput, bookingCreateSchema } from '@/lib/validation';

// Service Configuration - GST Rates per Service
const SERVICE_CONFIG = {
  'Drivers': { gstRate: 0.18 },
  'Pujari': { gstRate: 0 },
  'Maids': { gstRate: 0.18 },
  'Baby Sitters': { gstRate: 0.18 },
  'Nurses': { gstRate: 0.18 },
  'Attendants': { gstRate: 0.18 },
  'Cleaners': { gstRate: 0.18 },
  'Office Boys': { gstRate: 0.18 },
  'Chaprasi': { gstRate: 0.18 },
  'Heena Artists': { gstRate: 0.18 },
  'AC Service Technicians': { gstRate: 0.18 },
  'RO Service Technicians': { gstRate: 0.18 },
  'Refrigerator Service Technicians': { gstRate: 0.18 },
  'Air Purifier Service Technicians': { gstRate: 0.18 },
  'Toilet Cleaning Experts': { gstRate: 0.18 },
  'Chimney Service Technicians': { gstRate: 0.18 },
  'Security Guards': { gstRate: 0.18 },
};

// Get GST rate for a service (default 18% if not found)
function getServiceGstRate(serviceName) {
  const config = SERVICE_CONFIG[serviceName];
  return config ? config.gstRate : 0.18;
}

export async function POST(request) {
  try {
    await connectDB();
    console.log('✅ DB Connected');

    // Verify authentication
    const authResult = requireAuth(request);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const bookingData = await request.json();

    // VALIDATION: Validate input data with Zod
    const validation = validateInput(bookingData, bookingCreateSchema);
    if (!validation.success) {
      console.error('❌ Validation failed:', JSON.stringify(validation, null, 2));
      console.error('📦 Received booking data:', JSON.stringify(bookingData, null, 2));
      return NextResponse.json(
        { success: false, message: validation.message, errors: validation.errors },
        { status: 400 }
      );
    }

    const validatedData = validation.data;

    // SECURITY: Verify customerId matches authenticated user (prevent IDOR)
    if (validatedData.customerId && !verifyOwnership(authResult.user, validatedData.customerId, 'homeowner')) {
      return NextResponse.json(
        { success: false, message: 'You can only create bookings for your own account' },
        { status: 403 }
      );
    }

    // If no customerId provided, use authenticated user's ID
    if (!validatedData.customerId && authResult.user.audience === 'homeowner') {
      validatedData.customerId = authResult.user.id;
    }

    // Validate required fields
    const requiredFields = ['serviceId', 'serviceName', 'serviceCategory', 'customerPhone', 'customerAddress', 'bookingDate', 'bookingTime', 'providerId'];

    for (const field of requiredFields) {
      if (!validatedData[field]) {
        return NextResponse.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Resolve provider pricing
    const provider = await ServiceProvider.findById(validatedData.providerId);
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
    let hourlyBookingDetails = null;

    // NEW: Hourly booking support for all services
    if (bookingData.bookedHours && bookingData.bookedHours > 0) {
      // Validate hourly billing support
      const hourlySupport = checkHourlyBillingSupport(provider, bookingData.serviceName);

      if (!hourlySupport.supported) {
        return NextResponse.json(
          { success: false, message: hourlySupport.message },
          { status: 400 }
        );
      }

      const hourlyRate = hourlySupport.hourlyRate;
      const bookedHours = Number(bookingData.bookedHours);

      // Validate booked hours
      if (bookedHours < 1 || bookedHours > 24) {
        return NextResponse.json(
          { success: false, message: 'Booked hours must be between 1 and 24' },
          { status: 400 }
        );
      }

      // Driver car type validation
      if (bookingData.serviceCategory === 'driver' && bookingData.driverRequirements?.carType) {
        const carTypeValidation = validateDriverCarType(
          bookingData.driverRequirements.carType,
          provider.driverProfile?.carTypeSupported
        );

        if (!carTypeValidation.valid) {
          return NextResponse.json(
            { success: false, message: carTypeValidation.message },
            { status: 400 }
          );
        }
      }

      // Calculate scheduled times
      const bookingDateTime = new Date(bookingData.bookingDate);

      let hours = 0, minutes = 0;
      if (bookingData.bookingTime && typeof bookingData.bookingTime === 'string') {
        [hours, minutes] = bookingData.bookingTime.split(':').map(Number);
      } else {
        console.error('Invalid bookingTime:', bookingData.bookingTime);
      }

      bookingDateTime.setHours(hours, minutes, 0, 0);

      const scheduledStartTime = bookingDateTime;
      const expectedEndTime = new Date(scheduledStartTime);
      expectedEndTime.setHours(expectedEndTime.getHours() + bookedHours);

      // Calculate base cost
      const baseCost = bookedHours * hourlyRate;

      // Check shift overlap
      let partnerShiftStart = null;
      let partnerShiftEnd = null;

      if (provider.workingShifts && provider.workingShifts.enabled) {
        partnerShiftStart = provider.workingShifts.startTime;
        partnerShiftEnd = provider.workingShifts.endTime;
      }

      hourlyBookingDetails = {
        bookedHours,
        hourlyRate,
        scheduledStartTime,
        expectedEndTime,
        partnerShiftStart,
        partnerShiftEnd,
        baseCost,
        overtimeRate: hourlyRate, // Type 1 overtime rate (1×)
        shiftOvertimeRate: hourlyRate * 2, // Type 2 overtime rate (2×)
        totalHourlyCharge: baseCost
      };

      // Apply GST based on service configuration
      const gstRate = getServiceGstRate(bookingData.serviceName);
      const gstAmount = baseCost * gstRate;
      bookingData.totalPrice = Number((baseCost + gstAmount + extrasTotal).toFixed(2));

    } else if (bookingData.serviceCategory === 'driver') {
      // Legacy driver details (backward compatibility)
      const driverPayload = bookingData.driverDetails || {};
      const parseToMinutes = (value) => {
        if (!value || typeof value !== 'string' || !value.includes(':')) return null;
        try {
          const [hours, minutes] = value.split(':').map(Number);
          if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
          return hours * 60 + minutes;
        } catch (e) { return null; }
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
      bookingData.basePrice = baseCost + overtimeCost;

      // Apply GST based on service configuration
      const gstRate = getServiceGstRate(bookingData.serviceName);
      const gstAmount = (baseCost + overtimeCost) * gstRate;
      bookingData.totalPrice = Number((baseCost + overtimeCost + gstAmount + extrasTotal).toFixed(2));
    } else {
      // Standard fixed-price booking
      const quantity = Number(bookingData.quantity) || 1;
      const billingType = bookingData.billingType || 'one-time';
      const billingMultiplier = billingType === 'monthly' ? 4 : 1;
      const baseAmount = bookingData.basePrice + extrasTotal;

      // Apply GST based on service configuration
      const gstRate = getServiceGstRate(bookingData.serviceName);
      const gstAmount = baseAmount * gstRate;
      bookingData.totalPrice = (baseAmount + gstAmount) * billingMultiplier * quantity;
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
      hourlyBookingDetails,
      driverRequirements: bookingData.driverRequirements || null,
      assignedProvider: provider._id,
      providerName: provider.name,
      latitude: bookingData.latitude || null,
      longitude: bookingData.longitude || null,
      providerNavigationAddress: bookingData.providerNavigationAddress || null
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


    // Send persistent notification to provider
    if (provider) {
      await createAndSendNotification({
        title: '🔔 New Booking Request!',
        message: `${booking.customerName} has requested ${booking.serviceName}. Tap to view details.`,
        recipientId: provider._id.toString(),
        recipientType: 'provider',
        pushToken: provider.pushToken,
        type: 'new_booking',
        data: {
          type: 'new_booking',
          bookingId: booking._id.toString()
        },
        bookingId: booking._id.toString()
      });
    }

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
    console.error('Booking creation error TRACE:', error);
    console.error('Stack:', error.stack);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create booking',
        error: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}
