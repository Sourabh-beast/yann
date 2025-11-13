import crypto from "crypto";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Otp from "@/models/Otp";
import ServiceProvider from "@/models/ServiceProvider";
import Homeowner from "@/models/Homeowner";

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000;
const TOKEN_COOKIE_NAME = "yann_session";
const TOKEN_MAX_AGE = 60 * 60; // seconds

const sanitizeProvider = (provider) => ({
  id: provider._id.toString(),
  name: provider.name,
  email: provider.email,
  services: provider.services,
  status: provider.status,
  rating: provider.rating,
  totalReviews: provider.totalReviews,
  experience: provider.experience,
  phone: provider.phone,
  workingHours: provider.workingHours || null,
  profileImage: provider.profileImage || "",
});

const sanitizeHomeowner = (homeowner) => ({
  id: homeowner._id.toString(),
  name: homeowner.name,
  email: homeowner.email,
  phone: homeowner.phone || "",
  avatar: homeowner.avatar || "",
  preferences: homeowner.preferences || [],
  savedProviders: homeowner.savedProviders || [],
  addressBook: homeowner.addressBook || [],
});

export async function POST(req) {
  try {
    await connectDB();

    let payload;
    try {
      payload = await req.json();
    } catch (err) {
      return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 });
    }

    const email = payload?.email?.trim().toLowerCase();
    const otp = payload?.otp?.toString().trim();

    if (!email || !otp) {
      return NextResponse.json({ success: false, message: "Email and OTP are required" }, { status: 400 });
    }

    const requestedAudience = payload?.audience === "homeowner" ? "homeowner" : "provider";
    const rawIntent = payload?.intent === "signup" ? "signup" : "login";
    const intent = requestedAudience === "provider" ? "login" : rawIntent;

    const otpDoc = await Otp.findOne({ email, audience: requestedAudience });

    if (!otpDoc) {
      return NextResponse.json({ success: false, message: "OTP not found" }, { status: 400 });
    }

    const now = new Date();
    const ipHeader = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const requesterIp = ipHeader.split(",")[0].trim();

    if (otpDoc.blockedUntil && otpDoc.blockedUntil > now) {
      return NextResponse.json({ success: false, message: "Too many invalid attempts. Try again later." }, { status: 429 });
    }

    if (!otpDoc.expiresAt || otpDoc.expiresAt <= now) {
      await Otp.deleteMany({ email, audience: requestedAudience });
      return NextResponse.json({ success: false, message: "OTP expired" }, { status: 400 });
    }

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    if (hashedOtp !== otpDoc.otpHash) {
      const attempts = (otpDoc.attempts || 0) + 1;
      const update = {
        attempts,
        lastRequestIp: requesterIp,
      };

      if (attempts >= MAX_ATTEMPTS) {
        update.blockedUntil = new Date(now.getTime() + BLOCK_DURATION_MS);
      }

  await Otp.updateOne({ _id: otpDoc._id }, { $set: update });

      const status = attempts >= MAX_ATTEMPTS ? 429 : 400;
      const message = attempts >= MAX_ATTEMPTS ? "Too many invalid attempts. Try again later." : "Invalid OTP";

      return NextResponse.json({ success: false, message }, { status });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT secret is not configured");
      return NextResponse.json({ success: false, message: "Server configuration error" }, { status: 500 });
    }

    if (requestedAudience === "provider") {
      const provider = await ServiceProvider.findOne({ email });
      if (!provider) {
        await Otp.deleteMany({ email, audience: requestedAudience });
        return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
      }

      const token = jwt.sign({ email, id: provider._id.toString(), audience: "provider" }, process.env.JWT_SECRET, {
        expiresIn: `${TOKEN_MAX_AGE}s`,
      });

      const response = NextResponse.json({
        success: true,
        message: "OTP verified successfully",
        provider: sanitizeProvider(provider),
        audience: "provider",
      });

      response.cookies.set({
        name: TOKEN_COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: TOKEN_MAX_AGE,
        path: "/",
      });

      await Otp.deleteMany({ email, audience: requestedAudience });

      return response;
    }

    let homeowner = await Homeowner.findOne({ email });

    if (!homeowner) {
      if (intent !== "signup") {
        await Otp.deleteMany({ email, audience: requestedAudience });
        return NextResponse.json({ success: false, message: "Resident account not found" }, { status: 404 });
      }

      const nameFromMetadata = otpDoc.metadata?.name;
      if (!nameFromMetadata || typeof nameFromMetadata !== "string") {
        return NextResponse.json({ success: false, message: "Unable to create resident account" }, { status: 400 });
      }

      homeowner = await Homeowner.create({
        name: nameFromMetadata.trim(),
        email,
        phone: otpDoc.metadata?.phone ? otpDoc.metadata.phone.toString().trim() : undefined,
        preferences: Array.isArray(otpDoc.metadata?.preferences) ? otpDoc.metadata.preferences : [],
      });
    }

    homeowner.lastLoginAt = new Date();
    await homeowner.save();

    const token = jwt.sign({ email, id: homeowner._id.toString(), audience: "homeowner" }, process.env.JWT_SECRET, {
      expiresIn: `${TOKEN_MAX_AGE}s`,
    });

    const response = NextResponse.json({
      success: true,
      message: intent === "signup" ? "Resident account created" : "OTP verified successfully",
      homeowner: sanitizeHomeowner(homeowner),
      audience: "homeowner",
    });

    response.cookies.set({
      name: "yann_home_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: TOKEN_MAX_AGE,
      path: "/",
    });

    await Otp.deleteMany({ email, audience: requestedAudience });

    return response;
  } catch (err) {
    console.error("Error verifying OTP:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
