import { Expo } from 'expo-server-sdk';

// Create a new Expo SDK client
const expo = new Expo();

// ... (imports)

/**
 * Send a push notification to a single device
 * @param pushToken - Expo push token
 * @param title - Notification title
 * @param body - Notification body
 * @param data - Additional data to send with notification
 * @returns Promise with ticket or null if failed
 */
export async function sendPushNotification(pushToken, title, body, data = {}) {
  // Check that the push token is valid
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`❌ Invalid push token: ${pushToken}`);
    return null;
  }

  // Construct the notification message
  const message = {
    to: pushToken,
    sound: 'default',
    title,
    body,
    data, // data now ideally includes recipientId if passed from helper
    priority: 'high',
    channelId: data.channelId || 'default', // Explicit channel ID for Android
  };

  try {
    // Send the notification
    const ticketChunk = await expo.sendPushNotificationsAsync([message]);
    console.log('✅ Notification sent successfully:', ticketChunk);
    return ticketChunk[0];
  } catch (error) {
    console.error('❌ Error sending push notification:', error);
    return null;
  }
}

/**
 * Send push notifications to multiple devices
 * @param messages - Array of notification messages
 * @returns Promise with tickets array
 */
export async function sendBulkPushNotifications(messages) {
  // Filter out invalid tokens
  const validMessages = messages.filter(msg => Expo.isExpoPushToken(msg.to));

  if (validMessages.length === 0) {
    console.log('⚠️ No valid push tokens found');
    return [];
  }

  try {
    // Send notifications in chunks (Expo recommends chunks of 100)
    const chunks = expo.chunkPushNotifications(validMessages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('❌ Error sending notification chunk:', error);
      }
    }

    console.log(`✅ Sent ${tickets.length} notifications`);
    return tickets;
  } catch (error) {
    console.error('❌ Error sending bulk notifications:', error);
    return [];
  }
}

/**
 * Helper function to send service approval notification
 */
export async function sendServiceApprovalNotification(pushToken, providerName) {
  return await sendPushNotification(
    pushToken,
    '✅ Service Request Approved!',
    `Congratulations! Your service request has been approved. You can now receive bookings for your new services.`,
    { type: 'service_approved' }
  );
}

/**
 * Helper function to send service rejection notification
 */
export async function sendServiceRejectionNotification(pushToken, providerName, reason = '') {
  return await sendPushNotification(
    pushToken,
    '❌ Service Request Rejected',
    reason || 'Your service request was not approved. Please contact support for details.',
    { type: 'service_rejected' }
  );
}

/**
 * Helper function to send new booking notification to provider
 */
export async function sendNewBookingNotification(pushToken, serviceType, homeownerName, recipientId) {
  return await sendPushNotification(
    pushToken,
    '🔔 New Booking Request!',
    `${homeownerName} has requested ${serviceType}. Tap to view details.`,
    { type: 'new_booking', recipientId }
  );
}

/**
 * Helper function to send booking accepted notification to homeowner
 */
export async function sendBookingAcceptedNotification(pushToken, providerName, serviceType, recipientId) {
  return await sendPushNotification(
    pushToken,
    '✅ Booking Accepted!',
    `${providerName} has accepted your ${serviceType} booking. They will contact you soon.`,
    { type: 'booking_accepted', recipientId }
  );
}

/**
 * Helper function to send booking rejected notification to homeowner
 */
export async function sendBookingRejectedNotification(pushToken, providerName, serviceType) {
  return await sendPushNotification(
    pushToken,
    '❌ Booking Declined',
    `Unfortunately, ${providerName} cannot accept your ${serviceType} booking. Please try another provider.`,
    { type: 'booking_rejected' }
  );
}
/**
 * Helper function to send booking accepted notification with OTP to homeowner
 */
export async function sendBookingAcceptedWithOTPNotification(pushToken, serviceType, providerName, otp, bookingId) {
  return await sendPushNotification(
    pushToken,
    '✅ Booking Accepted!',
    `${providerName} has accepted your ${serviceType} booking. Your OTP to start the job is: ${otp}`,
    {
      type: 'booking_accepted',
      otp: otp,
      bookingId: bookingId,
      otpType: 'start'
    }
  );
}

/**
 * Helper function to send job start OTP notification to homeowner
 */
export async function sendJobStartOTPNotification(pushToken, serviceType, providerName, otp, bookingId, recipientId) {
  return await sendPushNotification(
    pushToken,
    '🔐 Job Starting Soon',
    `${providerName} is ready to start your ${serviceType} service. Your OTP is: ${otp}`,
    {
      type: 'job_start_otp',
      otp: otp,
      bookingId: bookingId,
      otpType: 'start',
      recipientId
    }
  );
}

/**
 * Helper function to send job end OTP notification to homeowner
 */
export async function sendJobEndOTPNotification(pushToken, serviceType, providerName, otp, bookingId) {
  return await sendPushNotification(
    pushToken,
    '🏁 Job Completion Verification',
    `${providerName} is completing your ${serviceType} service. Your verification OTP is: ${otp}`,
    {
      type: 'job_end_otp',
      otp: otp,
      bookingId: bookingId,
      otpType: 'end'
    }
  );
}
