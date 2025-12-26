import { Expo } from 'expo-server-sdk';

// Create a new Expo SDK client
const expo = new Expo();

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
    data,
    priority: 'high',
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
export async function sendNewBookingNotification(pushToken, serviceType, homeownerName) {
  return await sendPushNotification(
    pushToken,
    '🔔 New Booking Request!',
    `${homeownerName} has requested ${serviceType}. Tap to view details.`,
    { type: 'new_booking' }
  );
}

/**
 * Helper function to send booking accepted notification to homeowner
 */
export async function sendBookingAcceptedNotification(pushToken, providerName, serviceType) {
  return await sendPushNotification(
    pushToken,
    '✅ Booking Accepted!',
    `${providerName} has accepted your ${serviceType} booking. They will contact you soon.`,
    { type: 'booking_accepted' }
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
