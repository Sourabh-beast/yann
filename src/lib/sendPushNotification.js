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
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📤 SENDING PUSH NOTIFICATION');
  console.log('   Token:', pushToken?.substring(0, 30) + '...');
  console.log('   Title:', title);
  console.log('   Body:', body);
  console.log('   Data Keys:', Object.keys(data).join(', '));
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Check that the push token is valid
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ INVALID PUSH TOKEN');
    console.error('   Token:', pushToken);
    console.error('   Expected format: ExponentPushToken[...]');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return null;
  }

  console.log('✅ Push token format is valid');

  // Construct the notification message
  const message = {
    to: pushToken,
    sound: data.channelId === 'booking_requests' ? 'booking_request.wav' : 'default', // Custom buzzer for bookings
    title,
    body,
    data, // data now ideally includes recipientId if passed from helper
    priority: 'high',
    channelId: data.channelId || 'default', // Top-level channelId for Android
    // Collapse key: replaces old booking notifications instead of stacking
    ...(data.type === 'booking_request' && { collapseKey: `booking_request_${data.recipientId}` }),
    // Android-specific configuration
    // NOTE: Do NOT set `sound` here for Android 8+.  Android ignores the
    // payload sound in favour of the notification channel's sound setting.
    // Setting it risks resolving to 'default' if the filename isn't found at
    // the FCM layer, overriding our custom channel sound.
    android: {
      channelId: data.channelId || 'default',
      priority: 'max',
      badge: 1,
      // Tag ensures only one booking notification shows (replaces old ones)
      ...(data.type === 'booking_request' && { tag: 'booking_request' }),
    },
    // iOS-specific configuration
    ios: {
      sound: data.channelId === 'booking_requests' ? 'booking_request.wav' : 'default', // WAV is bundled via app.json sounds array
      _displayInForeground: true,
      badge: 1,
      // threadId groups notifications and replaces old ones
      ...(data.type === 'booking_request' && { threadId: 'booking_request' }),
    },
  };

  console.log('📦 Message payload:', JSON.stringify(message, null, 2));

  try {
    console.log('🚀 Sending to Expo push service...');
    // Send the notification
    const ticketChunk = await expo.sendPushNotificationsAsync([message]);
    const ticket = ticketChunk[0];

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📨 EXPO TICKET RESPONSE');
    console.log('   Status:', ticket.status);
    console.log('   ID:', ticket.id);

    if (ticket.status === 'error') {
      console.error('   Error Code:', ticket.details?.error);
      console.error('   Error Message:', ticket.message);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (ticket.status === 'ok') {
      console.log('✅ Notification sent successfully to Expo');
    } else {
      console.error('❌ Notification failed:', ticket);
    }

    return ticket;
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ PUSH NOTIFICATION EXCEPTION');
    console.error('   Error:', error.message);
    console.error('   Stack:', error.stack);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
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
