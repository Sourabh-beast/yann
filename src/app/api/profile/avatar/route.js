import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/connectDB";
import ServiceProvider from "@/models/ServiceProvider";

const TOKEN_COOKIE_NAME = "yann_session";
const DATA_URL_PATTERN = /^data:(image\/(png|jpeg|jpg|webp));base64,/i;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB

const unauthorizedResponse = (message = "Unauthorized") =>
  NextResponse.json({ success: false, message }, { status: 401 });

const validationErrorResponse = (message) =>
  NextResponse.json({ success: false, message }, { status: 400 });

const getAuthenticatedProvider = async () => {
  const token = cookies().get(TOKEN_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT secret is not configured");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error("Avatar upload token verification failed:", error);
    return null;
  }

  const provider = await ServiceProvider.findOne({ email: decoded.email });
  return provider;
};

export async function POST(req) {
  try {
    await connectDB();

    const provider = await getAuthenticatedProvider();
    if (!provider) {
      return unauthorizedResponse("Authentication required");
    }

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

    provider.profileImage = imageData;
    await provider.save();

    return NextResponse.json({
      success: true,
      profileImage: provider.profileImage,
      message: "Profile picture updated successfully",
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json({ success: false, message: "Unable to update profile picture" }, { status: 500 });
  }
}
