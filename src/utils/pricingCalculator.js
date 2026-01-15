/**
 * Pricing Calculator Utility
 * Handles GST calculations, hourly pricing, and booking cost calculations
 */

/**
 * Calculate GST amount
 * @param {number} baseAmount - Base amount without GST
 * @param {number} gstPercentage - GST percentage (default 18%)
 * @returns {object} - {gstAmount, totalWithGST}
 */
export function calculateGST(baseAmount, gstPercentage = 18) {
  const gstAmount = (baseAmount * gstPercentage) / 100;
  const totalWithGST = baseAmount + gstAmount;
  
  return {
    baseAmount: Math.round(baseAmount * 100) / 100,
    gstAmount: Math.round(gstAmount * 100) / 100,
    gstPercentage,
    totalWithGST: Math.round(totalWithGST * 100) / 100,
  };
}

/**
 * Calculate hourly service cost
 * @param {object} params
 * @param {string} params.startTime - Start time in HH:MM format
 * @param {string} params.endTime - End time in HH:MM format
 * @param {number} params.hourlyRate - Rate per hour
 * @param {number} params.gstPercentage - GST percentage
 * @returns {object} - Detailed cost breakdown
 */
export function calculateHourlyServiceCost({ startTime, endTime, hourlyRate, gstPercentage = 18 }) {
  // Convert time to minutes
  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  
  // Calculate duration in hours
  let durationMinutes = endMinutes - startMinutes;
  if (durationMinutes < 0) durationMinutes += 24 * 60; // Handle overnight bookings
  
  const durationHours = durationMinutes / 60;
  
  // Calculate base cost
  const baseCost = durationHours * hourlyRate;
  
  // Calculate GST
  const gstDetails = calculateGST(baseCost, gstPercentage);
  
  return {
    startTime,
    endTime,
    durationMinutes,
    durationHours: Math.round(durationHours * 100) / 100,
    hourlyRate,
    baseCost: gstDetails.baseAmount,
    ...gstDetails,
  };
}

/**
 * Calculate fixed service cost with GST
 * @param {number} fixedPrice - Fixed price set by partner
 * @param {number} gstPercentage - GST percentage
 * @returns {object} - Cost breakdown
 */
export function calculateFixedServiceCost(fixedPrice, gstPercentage = 18) {
  return calculateGST(fixedPrice, gstPercentage);
}

/**
 * Calculate overtime charges
 * @param {object} params
 * @param {number} params.actualMinutes - Actual time worked in minutes
 * @param {number} params.bookedMinutes - Booked time in minutes
 * @param {number} params.hourlyRate - Rate per hour
 * @param {number} params.overtimeMultiplier - Overtime rate multiplier (default 2x)
 * @returns {object} - Overtime breakdown
 */
export function calculateOvertimeCharges({ 
  actualMinutes, 
  bookedMinutes, 
  hourlyRate, 
  overtimeMultiplier = 2 
}) {
  const overtimeMinutes = Math.max(0, actualMinutes - bookedMinutes);
  const overtimeHours = overtimeMinutes / 60;
  const overtimeRate = hourlyRate * overtimeMultiplier;
  const overtimeCost = overtimeHours * overtimeRate;
  
  return {
    overtimeMinutes,
    overtimeHours: Math.round(overtimeHours * 100) / 100,
    overtimeRate,
    overtimeCost: Math.round(overtimeCost * 100) / 100,
  };
}

/**
 * Calculate total booking cost with extras
 * @param {object} params
 * @param {number} params.baseCost - Base service cost
 * @param {array} params.extras - Array of extra services {name, price}
 * @param {number} params.gstPercentage - GST percentage
 * @returns {object} - Total cost breakdown
 */
export function calculateBookingTotal({ baseCost, extras = [], gstPercentage = 18 }) {
  const extrasTotal = extras.reduce((sum, extra) => sum + (extra.price || 0), 0);
  const subtotal = baseCost + extrasTotal;
  const gstDetails = calculateGST(subtotal, gstPercentage);
  
  return {
    baseCost: Math.round(baseCost * 100) / 100,
    extrasTotal: Math.round(extrasTotal * 100) / 100,
    subtotal: Math.round(subtotal * 100) / 100,
    ...gstDetails,
    extras,
  };
}
