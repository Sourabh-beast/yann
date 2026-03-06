import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/connectDB";
import ServiceProvider from "@/models/ServiceProvider";
import Homeowner from "@/models/Homeowner";

const TOKEN_COOKIE_NAME = "yann_session";
const HOMEOWNER_COOKIE_NAME = "yann_home_session";
const DATA_URL_PATTERN = /^data:(image\/(png|jpeg|jpg|webp));base64,/i;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB

const unauthorizedResponse = (message = "Unauthorized") =>
  NextResponse.json({ success: false, message }, { status: 401 });

const validationErrorResponse = (message) =>
  NextResponse.json({ success: false, message }, { status: 400 });

const getAuthenticatedUser = async () => {
  // Try to get token from cookie first (for web)
  const cookieStore = await cookies();
  let token = cookieStore.get(TOKEN_COOKIE_NAME)?.value || cookieStore.get(HOMEOWNER_COOKIE_NAME)?.value;

  // If no cookie, try Authorization header (for mobile)
  if (!token) {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return { user: null, userType: null };
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT secret is not configured");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error("Avatar upload token verification failed:", error);
    return { user: null, userType: null };
  }

  // Try to find user based on audience first if available
  if (decoded.audience === 'provider') {
    let user = await ServiceProvider.findById(decoded.id);
    if (user) return { user, userType: 'provider' };
  } else if (decoded.audience === 'homeowner') {
    let user = await Homeowner.findById(decoded.id);
    if (user) return { user, userType: 'homeowner' };
  }

  // Fallback if audience is missing from token
  let user = await ServiceProvider.findById(decoded.id);
  if (user) {
    return { user, userType: 'provider' };
  }

  // If not found as provider, try homeowner
  user = await Homeowner.findById(decoded.id);
  if (user) {
    return { user, userType: 'homeowner' };
  }

  return { user: null, userType: null };
};

export async function POST(req) {
  try {
    await connectDB();

    const { user, userType } = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse("Authentication required");
    }

    console.log(`✅ Authenticated ${userType}:`, user.email);

    let payload;
    try {
      payload = await req.json();
      console.log('🚀 AVATAR DEBUG: Payload received', {
        hasImage: !!payload?.image,
        imageLength: payload?.image?.length
      });
    } catch (error) {
      console.error('🚀 AVATAR DEBUG: JSON Parse Error', error);
      return validationErrorResponse("Invalid request body");
    }

    const imageData = payload?.image;
    if (typeof imageData !== "string" || !imageData.trim()) {
      return validationErrorResponse("Profile image is required");
    }

    const match = imageData.match(DATA_URL_PATTERN);
    if (!match) {
      return validationErrorResponse("Invalid image format. Use PNG, JPG, or WEBP data URL");
    }

    let imageBuffer;
    try {
      const base64String = imageData.replace(DATA_URL_PATTERN, "");
      imageBuffer = Buffer.from(base64String, "base64");
    } catch (error) {
      console.error("Avatar base64 decode failed:", error);
      return validationErrorResponse("Unable to decode image");
    }

    if (imageBuffer.length > MAX_IMAGE_BYTES) {
      return validationErrorResponse("Image size should not exceed 2MB");
    }

    // Update avatar based on user type
    console.log(`🚀 AVATAR DEBUG: Updating user ${user._id} (${userType})`);

    // Explicitly mark modified to ensure mongoose saves it
    if (userType === 'provider') {
      user.profileImage = imageData;
      user.avatar = imageData; // Also set avatar for consistency
      user.markModified('profileImage');
      user.markModified('avatar');
      console.log('🚀 AVATAR DEBUG: Set provider profileImage/avatar');
    } else {
      user.avatar = imageData;
      user.profileImage = imageData; // Also set profileImage for consistency
      user.markModified('avatar');
      user.markModified('profileImage');
      console.log('🚀 AVATAR DEBUG: Set homeowner avatar/profileImage');
    }

    const savedUser = await user.save();
    console.log('🚀 AVATAR DEBUG: Save completed. Saved ID:', savedUser._id);
    console.log('🚀 AVATAR DEBUG: Saved Avatar Length:', savedUser.avatar?.length);

    console.log(`✅ Avatar updated for ${userType}:`, user.email);

    return NextResponse.json({
      success: true,
      message: "Profile picture updated successfully",
      data: {
        avatar: savedUser.avatar || savedUser.profileImage,
        profileImage: savedUser.profileImage || savedUser.avatar,
      }
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    // Log validation errors specifically
    if (error.name === 'ValidationError') {
      console.error("Validation Error Details:", JSON.stringify(error.errors, null, 2));
    }
    return NextResponse.json(
      { success: false, message: "Unable to update profile picture" },
      { status: 500 }
    );
  }
}
