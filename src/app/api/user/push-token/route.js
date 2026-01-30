import jwt from 'jsonwebtoken';
import { cookies, headers } from 'next/headers';

// Helper to get authenticated user (same as in profile/avatar/route.js)
const getAuthenticatedUser = async () => {
  // Try to get token from cookie first (for web)
  const cookieStore = await cookies();
  let token = cookieStore.get('yann_session')?.value || cookieStore.get('yann_home_session')?.value;

  // If no cookie, try Authorization header (for mobile)
  if (!token) {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return { userId: null, decoded: null };
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT secret is not configured");
    return { userId: null, decoded: null };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { userId: decoded.id || decoded._id, decoded };
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return { userId: null, decoded: null };
  }
};

/**
 * POST /api/user/push-token
 * Save or update user's push notification token
 */
export async function POST(request) {
  try {
    await connectDB();

    const { pushToken, userType } = await request.json();

    // Validate input
    if (!pushToken) {
      return NextResponse.json(
        { success: false, message: 'Push token is required' },
        { status: 400 }
      );
    }

    if (!userType || !['homeowner', 'provider'].includes(userType)) {
      return NextResponse.json(
        { success: false, message: 'Valid user type is required (homeowner or provider)' },
        { status: 400 }
      );
    }

    // Get user ID from token
    const { userId } = await getAuthenticatedUser();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User not authenticated' },
        { status: 401 }
      );
    }

    console.log(`📱 Saving push token for ${userType} ${userId}`);

    // Update the appropriate model
    const Model = userType === 'homeowner' ? Homeowner : ServiceProvider;

    const user = await Model.findByIdAndUpdate(
      userId,
      { pushToken },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    console.log(`✅ Push token saved for ${userType}:`, userId);

    return NextResponse.json({
      success: true,
      message: 'Push token saved successfully',
    });

  } catch (error) {
    console.error('Error saving push token:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to save push token' },
      { status: 500 }
    );
  }
}
