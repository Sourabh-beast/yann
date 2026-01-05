/**
 * Overtime Calculator Utility
 * 
 * Centralized logic for calculating overtime charges in the service booking system.
 * Supports two types of overtime:
 * - Type 1: Booking exceeded (actual time > booked time)
 * - Type 2: Shift-based premium (work beyond partner's shift)
 */

/**
 * Parse time string (HH:MM) to minutes since midnight
 * @param {string} timeString - Time in HH:MM format
 * @returns {number} Minutes since midnight
 */
export function parseTimeToMinutes(timeString) {
    if (!timeString || typeof timeString !== 'string' || !timeString.includes(':')) {
        return null;
    }

    const [hours, minutes] = timeString.split(':').map(Number);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        return null;
    }

    return hours * 60 + minutes;
}

/**
 * Extract time string (HH:MM) from Date object
 * @param {Date} date - Date object
 * @returns {string} Time in HH:MM format
 */
export function extractTimeString(date) {
    if (!(date instanceof Date)) {
        return null;
    }

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
}

/**
 * Calculate Type 1 Overtime: Booking Exceeded
 * 
 * When actual job time exceeds the booked duration.
 * Overtime rate is same as base hourly rate (1×).
 * 
 * @param {number} bookedMinutes - Booked duration in minutes
 * @param {number} actualMinutes - Actual job duration in minutes
 * @param {number} hourlyRate - Base hourly rate
 * @returns {Object} Overtime calculation result
 */
export function calculateBookingExceededOvertime(bookedMinutes, actualMinutes, hourlyRate) {
    if (!bookedMinutes || !actualMinutes || !hourlyRate) {
        return {
            overtimeMinutes: 0,
            overtimeHours: 0,
            overtimeCost: 0
        };
    }

    const overtimeMinutes = Math.max(0, actualMinutes - bookedMinutes);
    const overtimeHours = Number((overtimeMinutes / 60).toFixed(2));
    const overtimeCost = Number((overtimeHours * hourlyRate).toFixed(2));

    return {
        overtimeMinutes,
        overtimeHours,
        overtimeCost
    };
}

/**
 * Calculate Type 2 Overtime: Shift-Based Premium
 * 
 * When job extends beyond partner's registered shift.
 * Premium overtime rate is 2× base hourly rate.
 * 
 * @param {Date} actualStartTime - Actual job start time
 * @param {Date} actualEndTime - Actual job end time
 * @param {string} shiftEndTime - Partner's shift end time (HH:MM)
 * @param {number} hourlyRate - Base hourly rate
 * @returns {Object} Shift overtime calculation result
 */
export function calculateShiftBasedOvertime(actualStartTime, actualEndTime, shiftEndTime, hourlyRate) {
    if (!actualStartTime || !actualEndTime || !shiftEndTime || !hourlyRate) {
        return {
            shiftOvertimeMinutes: 0,
            shiftOvertimeHours: 0,
            shiftOvertimeCost: 0
        };
    }

    const shiftEndMinutes = parseTimeToMinutes(shiftEndTime);
    const actualEndTimeStr = extractTimeString(actualEndTime);
    const actualEndMinutes = parseTimeToMinutes(actualEndTimeStr);

    if (shiftEndMinutes === null || actualEndMinutes === null) {
        return {
            shiftOvertimeMinutes: 0,
            shiftOvertimeHours: 0,
            shiftOvertimeCost: 0
        };
    }

    const shiftOvertimeMinutes = Math.max(0, actualEndMinutes - shiftEndMinutes);
    const shiftOvertimeHours = Number((shiftOvertimeMinutes / 60).toFixed(2));
    const shiftOvertimeRate = hourlyRate * 2; // Premium rate
    const shiftOvertimeCost = Number((shiftOvertimeHours * shiftOvertimeRate).toFixed(2));

    return {
        shiftOvertimeMinutes,
        shiftOvertimeHours,
        shiftOvertimeCost,
        shiftOvertimeRate
    };
}

/**
 * Calculate Combined Overtime (Both Types)
 * 
 * Handles scenarios where both booking exceeded AND shift-based overtime apply.
 * Precedence rule: Shift premium (2×) takes precedence for overlapping time.
 * 
 * @param {Object} params - Calculation parameters
 * @param {number} params.bookedMinutes - Booked duration in minutes
 * @param {Date} params.actualStartTime - Actual job start time
 * @param {Date} params.actualEndTime - Actual job end time
 * @param {string} params.shiftEndTime - Partner's shift end time (HH:MM)
 * @param {number} params.hourlyRate - Base hourly rate
 * @returns {Object} Combined overtime calculation result
 */
export function calculateCombinedOvertime(params) {
    const { bookedMinutes, actualStartTime, actualEndTime, shiftEndTime, hourlyRate } = params;

    if (!actualStartTime || !actualEndTime || !hourlyRate) {
        return {
            actualMinutes: 0,
            regularMinutes: 0,
            regularCost: 0,
            bookingOvertimeMinutes: 0,
            bookingOvertimeCost: 0,
            shiftOvertimeMinutes: 0,
            shiftOvertimeCost: 0,
            totalCost: 0,
            overtimeType: 'none'
        };
    }

    // Calculate actual duration
    const durationMs = actualEndTime - actualStartTime;
    const actualMinutes = Math.floor(durationMs / (1000 * 60));

    // Calculate Type 1: Booking exceeded
    const bookingOvertimeMinutes = bookedMinutes ? Math.max(0, actualMinutes - bookedMinutes) : 0;

    // Calculate Type 2: Shift-based
    let shiftOvertimeMinutes = 0;
    if (shiftEndTime) {
        const shiftEndMinutesValue = parseTimeToMinutes(shiftEndTime);
        const actualEndTimeStr = extractTimeString(actualEndTime);
        const actualEndMinutes = parseTimeToMinutes(actualEndTimeStr);

        if (shiftEndMinutesValue !== null && actualEndMinutes !== null) {
            shiftOvertimeMinutes = Math.max(0, actualEndMinutes - shiftEndMinutesValue);
        }
    }

    // Determine overtime type and calculate charges
    let overtimeType = 'none';
    let regularMinutes = 0;
    let regularCost = 0;
    let bookingOvertimeCost = 0;
    let shiftOvertimeCost = 0;

    if (shiftOvertimeMinutes > 0 && bookingOvertimeMinutes > 0) {
        // Both types apply - shift premium takes precedence for overlapping time
        overtimeType = 'both';

        // Regular time (within booking and shift)
        regularMinutes = bookedMinutes ? Math.min(actualMinutes, bookedMinutes) : actualMinutes;
        regularCost = (regularMinutes / 60) * hourlyRate;

        // Booking exceeded but within shift
        const withinShiftOvertimeMinutes = Math.max(0, bookingOvertimeMinutes - shiftOvertimeMinutes);
        bookingOvertimeCost = (withinShiftOvertimeMinutes / 60) * hourlyRate;

        // Shift overtime (premium rate)
        const shiftOvertimeRate = hourlyRate * 2;
        shiftOvertimeCost = (shiftOvertimeMinutes / 60) * shiftOvertimeRate;

    } else if (shiftOvertimeMinutes > 0) {
        // Only shift overtime
        overtimeType = 'shift_based';
        regularMinutes = actualMinutes - shiftOvertimeMinutes;
        regularCost = (regularMinutes / 60) * hourlyRate;

        const shiftOvertimeRate = hourlyRate * 2;
        shiftOvertimeCost = (shiftOvertimeMinutes / 60) * shiftOvertimeRate;

    } else if (bookingOvertimeMinutes > 0) {
        // Only booking exceeded
        overtimeType = 'booking_exceeded';
        regularMinutes = bookedMinutes || 0;
        regularCost = (regularMinutes / 60) * hourlyRate;
        bookingOvertimeCost = (bookingOvertimeMinutes / 60) * hourlyRate;

    } else {
        // No overtime
        regularMinutes = actualMinutes;
        regularCost = (actualMinutes / 60) * hourlyRate;
    }

    const totalCost = regularCost + bookingOvertimeCost + shiftOvertimeCost;

    return {
        actualMinutes,
        regularMinutes,
        regularCost: Number(regularCost.toFixed(2)),
        bookingOvertimeMinutes,
        bookingOvertimeCost: Number(bookingOvertimeCost.toFixed(2)),
        shiftOvertimeMinutes,
        shiftOvertimeCost: Number(shiftOvertimeCost.toFixed(2)),
        totalCost: Number(totalCost.toFixed(2)),
        overtimeType
    };
}

/**
 * Validate booking times for consistency
 * 
 * @param {Date} scheduledStart - Scheduled start time
 * @param {Date} expectedEnd - Expected end time
 * @param {number} bookedHours - Booked hours
 * @returns {Object} Validation result
 */
export function validateBookingTimes(scheduledStart, expectedEnd, bookedHours) {
    const errors = [];

    if (!scheduledStart) {
        errors.push('Scheduled start time is required');
    }

    if (!expectedEnd) {
        errors.push('Expected end time is required');
    }

    if (!bookedHours || bookedHours <= 0) {
        errors.push('Booked hours must be greater than 0');
    }

    if (bookedHours > 24) {
        errors.push('Booked hours cannot exceed 24 hours');
    }

    if (scheduledStart && expectedEnd) {
        const durationMs = expectedEnd - scheduledStart;
        const durationHours = durationMs / (1000 * 60 * 60);

        if (Math.abs(durationHours - bookedHours) > 0.01) {
            errors.push('Expected end time does not match booked hours');
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Apply maximum overtime cap
 * 
 * @param {number} overtimeHours - Calculated overtime hours
 * @param {number} maxCap - Maximum allowed overtime hours (default: 8)
 * @returns {number} Capped overtime hours
 */
export function applyOvertimeCap(overtimeHours, maxCap = 8) {
    return Math.min(overtimeHours, maxCap);
}
