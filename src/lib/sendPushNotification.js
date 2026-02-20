import { Expo } from 'expo-server-sdk';

const expo = new Expo();

/**
 * Send a push notification to a single device
 */
export async function sendPushNotification(pushToken, title, body, data = {}) {
  console.log(`📤 Push → ${title} | channel: ${data.channelId || 'default'} | token: ${pushToken?.substring(0, 25)}...`);

  if (!Expo.isExpoPushToken(pushToken)) {
    console.error('❌ Invalid push token:', pushToken);
    return null;
  }

  const message = {
    to: pushToken,
    // ALWAYS 'default' — FCM needs this to show a visible banner.
    // The actual sound on Android 8+ is controlled by the notification channel.
    sound: 'default',
    title,
    body,
    data,
    priority: 'high',
    channelId: data.channelId || 'default',
    ...(data.type === 'booking_request' && { collapseKey: `booking_request_${data.recipientId}` }),
    android: {
      channelId: data.channelId || 'default',
      priority: 'max',
      badge: 1,
      ...(data.type === 'booking_request' && { tag: 'booking_request' }),
    },
    ios: {
      sound: data.channelId === 'booking_alert_v2' ? 'booking_request.mp3' : 'default',
      _displayInForeground: true,
      badge: 1,
      ...(data.type === 'booking_request' && { threadId: 'booking_request' }),
    },
  };

  try {
    const ticketChunk = await expo.sendPushNotificationsAsync([message]);
    const ticket = ticketChunk[0];

    if (ticket.status === 'ok') {
      console.log(`✅ Push sent → ticket: ${ticket.id}`);
    } else {
      console.error('❌ Push failed:', ticket.details?.error, ticket.message);
    }

    return ticket;
  } catch (error) {
    console.error('❌ Push exception:', error.message);
    return null;
  }
}

/**
 * Send push notifications to multiple devices
 */
export async function sendBulkPushNotifications(messages) {
  const validMessages = messages.filter(msg => Expo.isExpoPushToken(msg.to));

  if (validMessages.length === 0) {
    console.warn('⚠️ No valid push tokens found');
    return [];
  }

  try {
    const chunks = expo.chunkPushNotifications(validMessages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('❌ Chunk send error:', error.message);
      }
    }

    console.log(`✅ Sent ${tickets.length} bulk notifications`);
    return tickets;
  } catch (error) {
    console.error('❌ Bulk send error:', error.message);
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
