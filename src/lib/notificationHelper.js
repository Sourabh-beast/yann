import Notification from '@/models/Notification';
import { sendPushNotification } from './sendPushNotification';
import connectDB from './connectDB';

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

    // 2. Send Push Notification (Fire and Forget or Await based on preference, here we await to log)
    if (pushToken) {
        // Ensure recipientId is in the data payload for frontend filtering
        const pushData = { ...data, recipientId, notificationId: notification._id.toString() };
        
        await sendPushNotification(pushToken, title, message, pushData);
        
        // Update stats (optional, but good for tracking)
        await Notification.updateOne(
            { _id: notification._id },
            { $inc: { 'stats.sent': 1, 'stats.delivered': 1 } } // Assuming delivered if no error
        );
    } else {
        console.log(`⚠️ No push token for user ${recipientId}, saved to DB only.`);
    }

    return notification;

  } catch (error) {
    console.error('❌ Error in createAndSendNotification:', error);
    // Even if it fails, we don't want to crash the main flow, usually. 
    // But since this is a helper, the caller might handle it. 
    // We'll return null to indicate failure but suppress the throw to avoid blocking critical flows like "Start Job"
    return null;
  }
}
