import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/connectDB";
import ServiceProvider from "@/models/ServiceProvider";
import Homeowner from "@/models/Homeowner";

const TOKEN_COOKIE_NAME = "yann_session";
const DATA_URL_PATTERN = /^data:(image\/(png|jpeg|jpg|webp));base64,/i;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB

const unauthorizedResponse = (message = "Unauthorized") =>
  NextResponse.json({ success: false, message }, { status: 401 });

const validationErrorResponse = (message) =>
  NextResponse.json({ success: false, message }, { status: 400 });

const getAuthenticatedUser = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
  
  console.log('🔍 Avatar upload - checking auth');
  console.log('Token exists:', !!token);
  
  if (!token) {
    console.log('❌ No token found in cookies');
    return null;
  }

  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET not configured');
    throw new Error("JWT secret is not configured");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded, email:', decoded.email, 'audience:', decoded.audience);
  } catch (error) {
    console.error("❌ Avatar upload token verification failed:", error.message);
    return null;
  }

  // Try to find as provider first
  let user = await ServiceProvider.findOne({ email: decoded.email });
  let userType = 'provider';
  
  // If not found, try homeowner
  if (!user) {
    user = await Homeowner.findOne({ email: decoded.email });
    userType = 'homeowner';
  }
  
  if (user) {
    console.log('✅ User found:', userType, user.email);
  } else {
    console.log('❌ User not found for email:', decoded.email);
  }
  
  return user ? { user, userType } : null;
};

export async function POST(req) {
  try {
    await connectDB();

    const result = await getAuthenticatedUser();
    if (!result) {
      return unauthorizedResponse("Authentication required");
    }

    const { user, userType } = result;

    let payload;
    try {
      payload = await req.json();
    } catch (error) {
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

    // Update the appropriate field based on user type
    if (userType === 'provider') {
      user.profileImage = imageData;
    } else {
      user.avatar = imageData;
    }
    
    await user.save();

    // Return appropriate field name
    const responseData = {
      success: true,
      message: "Profile picture updated successfully",
    };

    if (userType === 'provider') {
      responseData.profileImage = user.profileImage;
      responseData.data = { profileImage: user.profileImage };
    } else {
      responseData.avatar = user.avatar;
      responseData.data = { avatar: user.avatar };
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json({ success: false, message: "Unable to update profile picture" }, { status: 500 });
  }
}
