import connectDB from './connectDB';
import Notification from '../models/Notification';

/**
 * Saves an in-app notification to MongoDB so it appears in the user's notification screen.
 */
export async function sendPushNotification(params: {
  userId: string;
  userType: 'homeowner' | 'provider';
  title: string;
  body: string;
  data?: Record<string, any>;
}) {
  const { userId, userType, title, body, data } = params;

  console.log('📧 Saving in-app notification:', { userId, userType, title });

  try {
    await connectDB();
    await (Notification as any).create({
      type: 'general',
      targetAudience: 'specific',
      recipients: [{ userId, userType }],
      title,
      message: body,
      status: 'sent',
      sentAt: new Date(),
      metadata: data || {},
    });
    console.log('✅ In-app notification saved:', title);
  } catch (err) {
    console.error('❌ Failed to save notification to DB:', err);
  }

  return {
    success: true,
    message: 'Notification saved',
  };
}

export async function sendIdentityApprovalNotification(userId: string, userType: 'homeowner' | 'provider', userName: string) {
  const title = '✅ Identity Verified';
  const body = `Congratulations ${userName}! Your identity verification has been approved. You can now access all features.`;

  return sendPushNotification({
    userId,
    userType,
    title,
    body,
    data: {
      type: 'identity_approved',
      timestamp: new Date().toISOString(),
    },
  });
}

export async function sendIdentityRejectionNotification(
  userId: string,
  userType: 'homeowner' | 'provider',
  userName: string,
  reason: string
) {
  const title = '❌ Identity Verification Rejected';
  const body = `Hello ${userName}, your identity verification was rejected. Reason: ${reason}. Please resubmit with correct documents.`;

  return sendPushNotification({
    userId,
    userType,
    title,
    body,
    data: {
      type: 'identity_rejected',
      reason,
      timestamp: new Date().toISOString(),
    },
  });
}
