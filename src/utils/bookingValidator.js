/**
 * Booking Validator Utility
 * 
 * Validation rules for service bookings, including:
 * - Driver car type matching
 * - Hourly booking validation
 * - Shift overlap detection
 */

/**
 * Validate driver car type requirement vs partner capability
 * 
 * @param {string} userRequirement - User's car type requirement ('manual' or 'automatic')
 * @param {string} partnerSupported - Partner's supported car type ('manual', 'automatic', or 'both')
 * @returns {Object} Validation result
 */
export function validateDriverCarType(userRequirement, partnerSupported) {
    // If no requirement specified, any partner is acceptable
    if (!userRequirement) {
        return {
            valid: true,
            message: 'No car type requirement specified'
        };
    }

    // If partner hasn't specified, reject
    if (!partnerSupported) {
        return {
            valid: false,
            message: 'Partner has not specified supported car types'
        };
    }

    // Check compatibility
    if (partnerSupported === 'both') {
        return {
            valid: true,
            message: 'Partner supports both manual and automatic'
        };
    }

    if (partnerSupported === userRequirement) {
        return {
            valid: true,
            message: `Partner supports ${userRequirement} cars`
        };
    }

    return {
        valid: false,
        message: `Partner only supports ${partnerSupported} cars, but you requested ${userRequirement}`
    };
}

/**
 * Validate hourly booking parameters
 * 
 * @param {number} bookedHours - Number of hours booked
 * @param {number} hourlyRate - Partner's hourly rate
 * @param {string} partnerId - Partner ID
 * @returns {Object} Validation result
 */
export function validateHourlyBooking(bookedHours, hourlyRate, partnerId) {
    const errors = [];

    if (!bookedHours || bookedHours <= 0) {
        errors.push('Booked hours must be greater than 0');
    }

    if (bookedHours < 1) {
        errors.push('Minimum booking is 1 hour');
    }

    if (bookedHours > 24) {
        errors.push('Maximum booking is 24 hours');
    }

    if (!hourlyRate || hourlyRate <= 0) {
        errors.push('Partner has not set an hourly rate for this service');
    }

    if (!partnerId) {
        errors.push('Partner ID is required');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Validate shift overlap and calculate potential overtime
 * 
 * @param {string} bookingStartTime - Booking start time (HH:MM)
 * @param {string} bookingEndTime - Expected booking end time (HH:MM)
 * @param {string} shiftStartTime - Partner's shift start time (HH:MM)
 * @param {string} shiftEndTime - Partner's shift end time (HH:MM)
 * @returns {Object} Validation and overlap result
 */
export function validateShiftOverlap(bookingStartTime, bookingEndTime, shiftStartTime, shiftEndTime) {
    // If shift not configured, no validation needed
    if (!shiftStartTime || !shiftEndTime) {
        return {
            valid: true,
            withinShift: true,
            overtimeMinutes: 0,
            warning: null
        };
    }

    const parseTimeToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const bookingStartMinutes = parseTimeToMinutes(bookingStartTime);
    const bookingEndMinutes = parseTimeToMinutes(bookingEndTime);
    const shiftStartMinutes = parseTimeToMinutes(shiftStartTime);
    const shiftEndMinutes = parseTimeToMinutes(shiftEndTime);

    // Check if booking starts before shift
    if (bookingStartMinutes < shiftStartMinutes) {
        return {
            valid: false,
            withinShift: false,
            overtimeMinutes: 0,
            warning: `Booking starts at ${bookingStartTime}, but partner's shift starts at ${shiftStartTime}`
        };
    }

    // Check if booking ends after shift
    if (bookingEndMinutes > shiftEndMinutes) {
        const overtimeMinutes = bookingEndMinutes - shiftEndMinutes;
        const overtimeHours = (overtimeMinutes / 60).toFixed(1);

        return {
            valid: true,
            withinShift: false,
            overtimeMinutes,
            warning: `Booking extends ${overtimeHours} hours beyond partner's shift. Premium overtime charges (2× rate) will apply.`
        };
    }

    // Booking is within shift
    return {
        valid: true,
        withinShift: true,
        overtimeMinutes: 0,
        warning: null
    };
}

/**
 * Validate booking date and time
 * 
 * @param {Date} bookingDate - Booking date
 * @param {string} bookingTime - Booking time (HH:MM)
 * @returns {Object} Validation result
 */
export function validateBookingDateTime(bookingDate, bookingTime) {
    const errors = [];

    if (!bookingDate) {
        errors.push('Booking date is required');
    }

    if (!bookingTime) {
        errors.push('Booking time is required');
    }

    if (bookingDate && bookingTime) {
        const [hours, minutes] = bookingTime.split(':').map(Number);
        const bookingDateTime = new Date(bookingDate);
        bookingDateTime.setHours(hours, minutes, 0, 0);

        const now = new Date();

        if (bookingDateTime < now) {
            errors.push('Booking date and time must be in the future');
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Check if partner supports hourly billing for a service
 * 
 * @param {Object} provider - Service provider object
 * @param {string} serviceName - Service name
 * @returns {Object} Support check result
 */
export function checkHourlyBillingSupport(provider, serviceName) {
    if (!provider || !provider.serviceRates || !Array.isArray(provider.serviceRates)) {
        return {
            supported: false,
            message: 'Provider service rates not found'
        };
    }

    const normalized = serviceName.trim().toLowerCase();
    const serviceRate = provider.serviceRates.find(
        rate => rate.serviceName?.trim().toLowerCase() === normalized
    );

    if (!serviceRate) {
        return {
            supported: false,
            message: 'Service not found in provider rates'
        };
    }

    if (!serviceRate.hourlyRate || serviceRate.hourlyRate <= 0) {
        return {
            supported: false,
            message: 'Provider has not set an hourly rate for this service'
        };
    }

    if (serviceRate.billingType !== 'hourly' && serviceRate.billingType !== 'both') {
        return {
            supported: false,
            message: 'Provider does not support hourly billing for this service'
        };
    }

    return {
        supported: true,
        hourlyRate: serviceRate.hourlyRate,
        message: 'Hourly billing supported'
    };
}

/**
 * Validate complete booking request
 * 
 * @param {Object} bookingData - Booking request data
 * @param {Object} provider - Service provider object
 * @returns {Object} Comprehensive validation result
 */
export function validateBookingRequest(bookingData, provider) {
    const errors = [];
    const warnings = [];

    // Validate basic fields
    if (!bookingData.serviceId || !bookingData.serviceName) {
        errors.push('Service information is required');
    }

    if (!bookingData.customerPhone) {
        errors.push('Customer phone is required');
    }

    if (!bookingData.customerAddress) {
        errors.push('Customer address is required');
    }

    // Validate hourly booking if applicable
    if (bookingData.bookedHours) {
        const hourlyValidation = validateHourlyBooking(
            bookingData.bookedHours,
            provider?.serviceRates?.find(r => r.serviceName === bookingData.serviceName)?.hourlyRate,
            provider?._id
        );

        if (!hourlyValidation.valid) {
            errors.push(...hourlyValidation.errors);
        }
    }

    // Validate driver car type if applicable
    if (bookingData.serviceCategory === 'driver' && bookingData.driverRequirements?.carType) {
        const carTypeValidation = validateDriverCarType(
            bookingData.driverRequirements.carType,
            provider?.driverProfile?.carTypeSupported
        );

        if (!carTypeValidation.valid) {
            errors.push(carTypeValidation.message);
        }
    }

    // Validate date and time
    const dateTimeValidation = validateBookingDateTime(
        bookingData.bookingDate,
        bookingData.bookingTime
    );

    if (!dateTimeValidation.valid) {
        errors.push(...dateTimeValidation.errors);
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}
