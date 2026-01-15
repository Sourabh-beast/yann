import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Booking from '@/models/Booking';
import Service from '@/models/Service';
import ServiceProvider from '@/models/ServiceProvider';
import ResidentRequest from '@/models/ResidentRequest';
import { createAndSendNotification } from '@/lib/notificationHelper';
import { validateDriverCarType, checkHourlyBillingSupport } from '@/utils/bookingValidator';
import { requireAuth, verifyOwnership } from '@/lib/authMiddleware';
import { validateInput, bookingCreateSchema } from '@/lib/validation';
import { calculateGST, calculateHourlyServiceCost, calculateFixedServiceCost, calculateBookingTotal } from '@/utils/pricingCalculator';

// Service Configuration - GST Rates per Service (Based on Services charges.xlsx)
const SERVICE_CONFIG = {
  // ===== DRIVERS (18% GST) =====
  'Full-Day Personal Driver': { gstRate: 0.18, hasOvertime: true },
  'Outstation Driving Service': { gstRate: 0.18, hasOvertime: true },

  // ===== PUJARI SERVICES (0% GST) =====
  'Lakshmi Puja': { gstRate: 0 },
  'Satyanarayan Katha': { gstRate: 0 },
  'Ganesh Puja at Home': { gstRate: 0 },
  'Griha Pravesh Puja': { gstRate: 0 },
  'Vastu Shanti Puja': { gstRate: 0 },
  'Havan Ceremony': { gstRate: 0 },
  'Rudrabhishek Puja': { gstRate: 0 },
  'Vivah (Wedding Ceremony)': { gstRate: 0 },
  'Ring Ceremony': { gstRate: 0 },
  'Ramjan Path': { gstRate: 0 },
  'Mahamrityunjay Jaap': { gstRate: 0 },
  'Gayatri Jaap': { gstRate: 0 },
  'Pitra Shanti Puja': { gstRate: 0 },
  'Nav Graha Shanti': { gstRate: 0 },
  'Bhoomi Poojan': { gstRate: 0 },
  'Vaahan Poojan': { gstRate: 0 },
  'Shraddh Karm': { gstRate: 0 },
  'Janmadin Poojan': { gstRate: 0 },
  'Sundarkand Path': { gstRate: 0 },

  // ===== CLEANING SERVICES (18% GST) =====
  'Deep House Cleaning': { gstRate: 0.18, hasOvertime: true },
  'Regular House Cleaning': { gstRate: 0.18, hasOvertime: true },
  'Bathroom Deep Clean': { gstRate: 0.18, hasOvertime: true },
  'Car Washing': { gstRate: 0.18 },
  'Laundry & Ironing': { gstRate: 0.18, hasOvertime: true },
  'Dry Cleaning Service': { gstRate: 0.18 },
  'Chimney & Exhaust Cleaning': { gstRate: 0.18 },
  'Water Tank Cleaning': { gstRate: 0.18, hasOvertime: true },
};

// Get GST rate for a service (default 18% if not found)
function getServiceGstRate(serviceName, serviceCategory) {
  // Check category first - all pujari services have 0% GST
  if (serviceCategory === 'pujari') {
    return 0;
  }

  // Then check specific service name
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

    // Fetch service config to determine pricing model and GST
    const serviceConfig = await Service.findOne({ 
      title: bookingData.serviceName,
      category: bookingData.serviceCategory 
    });

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
    let pricingBreakdown = null;

    // NEW: Unified pricing calculation using Service model
    const pricingModel = serviceConfig?.pricingModel || 'fixed';
    const gstPercentage = serviceConfig?.gstPercentage ?? 18;

    // Check if this is an hourly service booking with start/end times
    const hasTimeRange = bookingData.startTime && bookingData.endTime;

    if (pricingModel === 'hourly' && hasTimeRange) {
      // HOURLY PRICING: Calculate cost based on start/end times
      
      // Validate hourly billing support
      const hourlySupport = checkHourlyBillingSupport(provider, bookingData.serviceName);

      if (!hourlySupport.supported) {
        return NextResponse.json(
          { success: false, message: hourlySupport.message },
          { status: 400 }
        );
      }

      const hourlyRate = hourlySupport.hourlyRate;

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

      // Use pricing calculator for hourly service
      const hourlyCost = calculateHourlyServiceCost(
        bookingData.startTime,
        bookingData.endTime,
        hourlyRate
      );

      if (!hourlyCost.success) {
        return NextResponse.json(
          { success: false, message: hourlyCost.error },
          { status: 400 }
        );
      }

      // Calculate GST
      const gst = calculateGST(hourlyCost.baseCost, gstPercentage);

      // Calculate booking date/time
      const bookingDateTime = new Date(bookingData.bookingDate);
      let hours = 0, minutes = 0;
      if (bookingData.startTime && typeof bookingData.startTime === 'string') {
        [hours, minutes] = bookingData.startTime.split(':').map(Number);
      }
      bookingDateTime.setHours(hours, minutes, 0, 0);

      const scheduledStartTime = bookingDateTime;
      const expectedEndTime = new Date(scheduledStartTime);
      expectedEndTime.setMinutes(expectedEndTime.getMinutes() + hourlyCost.durationMinutes);

      // Check shift overlap
      let partnerShiftStart = null;
      let partnerShiftEnd = null;

      if (provider.workingShifts && provider.workingShifts.enabled) {
        partnerShiftStart = provider.workingShifts.startTime;
        partnerShiftEnd = provider.workingShifts.endTime;
      }

      hourlyBookingDetails = {
        bookedHours: hourlyCost.duration,
        hourlyRate,
        scheduledStartTime,
        expectedEndTime,
        partnerShiftStart,
        partnerShiftEnd,
        baseCost: hourlyCost.baseCost,
        overtimeRate: hourlyRate,
        shiftOvertimeRate: hourlyRate * 2,
        totalHourlyCharge: hourlyCost.baseCost
      };

      pricingBreakdown = {
        baseCost: hourlyCost.baseCost,
        gst: gst.gstAmount,
        gstPercentage: gstPercentage,
        extras: extrasTotal,
        subtotal: hourlyCost.baseCost + extrasTotal,
        total: hourlyCost.baseCost + gst.gstAmount + extrasTotal,
        breakdown: {
          startTime: bookingData.startTime,
          endTime: bookingData.endTime,
          duration: `${hourlyCost.duration} ${hourlyCost.duration === 1 ? 'hour' : 'hours'}`,
          hourlyRate: `₹${hourlyRate}/hr`,
          gstRate: `${gstPercentage}%`
        }
      };

      bookingData.basePrice = hourlyCost.baseCost;
      bookingData.totalPrice = Number(pricingBreakdown.total.toFixed(2));

    } else if (pricingModel === 'fixed' || !hasTimeRange) {
      // FIXED PRICING: One-time fixed cost with GST
      
      const quantity = Number(bookingData.quantity) || 1;
      const billingType = bookingData.billingType || 'one-time';
      const billingMultiplier = billingType === 'monthly' ? 4 : 1;

      // Use pricing calculator for fixed service
      const fixedCost = calculateFixedServiceCost(
        bookingData.basePrice,
        gstPercentage,
        quantity
      );

      const totalBooking = calculateBookingTotal(
        fixedCost.totalWithGST,
        extrasTotal
      );

      pricingBreakdown = {
        baseCost: bookingData.basePrice,
        gst: fixedCost.gstAmount,
        gstPercentage: gstPercentage,
        extras: extrasTotal,
        quantity: quantity,
        subtotal: fixedCost.subtotal,
        total: totalBooking.grandTotal * billingMultiplier,
        breakdown: {
          basePrice: `₹${bookingData.basePrice}`,
          quantity: quantity > 1 ? `${quantity} unit${quantity > 1 ? 's' : ''}` : '1 service',
          gstRate: `${gstPercentage}%`,
          billingType: billingType
        }
      };

      bookingData.totalPrice = Number(pricingBreakdown.total.toFixed(2));

    } else if (bookingData.serviceCategory === 'driver' && bookingData.driverDetails?.endTime) {
      // Legacy driver details (only if end time is explicitly provided)
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
      const endMinutes = parseToMinutes(driverPayload.endTime);

      // Only apply driver calculation if we have valid times
      if (startMinutes !== null && endMinutes !== null && endMinutes > startMinutes) {
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
        const resolvedEndTime = driverPayload.endTime;

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
        const gstRate = getServiceGstRate(bookingData.serviceName, bookingData.serviceCategory);
        const gstAmount = (baseCost + overtimeCost) * gstRate;
        bookingData.totalPrice = Number((baseCost + overtimeCost + gstAmount + extrasTotal).toFixed(2));
      } else {
        // Fallback to standard booking if times are invalid
        const quantity = Number(bookingData.quantity) || 1;
        const billingType = bookingData.billingType || 'one-time';
        const billingMultiplier = billingType === 'monthly' ? 4 : 1;
        const baseAmount = bookingData.basePrice + extrasTotal;

        const gstRate = getServiceGstRate(bookingData.serviceName, bookingData.serviceCategory);
        const gstAmount = baseAmount * gstRate;
        bookingData.totalPrice = (baseAmount + gstAmount) * billingMultiplier * quantity;
      }

    } else {
      // Standard fixed-price booking
      const quantity = Number(bookingData.quantity) || 1;
      const billingType = bookingData.billingType || 'one-time';
      const billingMultiplier = billingType === 'monthly' ? 4 : 1;
      const baseAmount = bookingData.basePrice + extrasTotal;

      // Apply GST based on service configuration
      const gstRate = getServiceGstRate(bookingData.serviceName, bookingData.serviceCategory);
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
      pricingBreakdown,
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
      services: { $in: [serviceName] },
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
