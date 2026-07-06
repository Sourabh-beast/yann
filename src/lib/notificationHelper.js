import { after } from 'next/server';
import Notification from '@/models/Notification';
import { sendPushNotification } from './sendPushNotification';
import connectDB from './connectDB';
import logger from './logger';

/**
 * Creates a notification in the database and sends a push notification.
 * 
 * @param {object} params
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message/body
 * @param {string} params.recipientId - ID of the user receiving the notification
 * @param {string} params.recipientType - 'homeowner' or 'provider' (or 'providerResponse' mapped to provider)
 * @param {string} params.pushToken - Expo push token of the user
 * @param {string} params.type - Notification type (e.g., 'new_booking', 'booking_accepted', 'otp_start')
 * @param {object} params.data - Additional data for the push notification
 * @param {string} params.bookingId - Related booking ID (optional)
 * @param {string} params.senderId - ID of the sender (optional, e.g., 'System' or user ID)
 */
export async function createAndSendNotification({
  title,
  message,
  recipientId,
  recipientType = 'homeowner',
  pushToken,
  type = 'general',
  data = {},
  bookingId = null,
  senderId = 'System'
}) {
  try {
    // Ensure DB connection
    await connectDB();

    // 1. Create Persistent Notification Record

    const notification = new Notification({
      type: type || 'in-app', // Use the passed type (payment_required, job_completed, etc.)
      targetAudience: 'specific',
      recipients: [{
        userId: recipientId,
        userType: recipientType === 'provider' ? 'provider' : 'homeowner', // Normalize
      }],
      title,
      message,
      // Map domain specific types to category/tags
      category: type.includes('otp') || type.includes('booking') ? 'transactional' : 'system',
      tags: [type, bookingId ? `booking:${bookingId}` : null].filter(Boolean),
      status: 'sent',
      sentAt: new Date(),
      sentBy: senderId,
      // Store extra data that might be needed for navigation
      actionUrl: data.screen ? `${data.screen}?id=${data.bookingId}` : null,
      // Store the raw data for flexibility
      metadata: { ...data, bookingId, otp: data.otp } 
    });

    await notification.save();

    // 2. Send push notification after the response is sent, not before.
    // This is already best-effort (errors here were previously swallowed too -
    // see catch below), so deferring it only removes its latency from the
    // caller's response; it does not change delivery guarantees.
    if (pushToken) {
        // Ensure recipientId is in the data payload for frontend filtering
        const pushData = { ...data, recipientId, notificationId: notification._id.toString() };

        after(async () => {
            try {
                await sendPushNotification(pushToken, title, message, pushData);

                // Update stats (optional, but good for tracking)
                await Notification.updateOne(
                    { _id: notification._id },
                    { $inc: { 'stats.sent': 1, 'stats.delivered': 1 } } // Assuming delivered if no error
                );
            } catch (deferredError) {
                logger.error({ err: deferredError, notificationId: notification._id.toString() }, 'Deferred push send/stats update failed');
            }
        });
    } else {
        logger.info({ recipientId }, 'No push token for user, saved to DB only');
    }

    return notification;

  } catch (error) {
    logger.error({ err: error }, 'Error in createAndSendNotification');
    // Even if it fails, we don't want to crash the main flow, usually. 
    // But since this is a helper, the caller might handle it. 
    // We'll return null to indicate failure but suppress the throw to avoid blocking critical flows like "Start Job"
    return null;
  }
}
