import crypto from "crypto";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Otp from "@/models/Otp";
import ServiceProvider from "@/models/ServiceProvider";

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

    const otpDoc = await Otp.findOne({ email });

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
      await Otp.deleteMany({ email });
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

    const provider = await ServiceProvider.findOne({ email });
    if (!provider) {
      await Otp.deleteMany({ email });
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT secret is not configured");
      return NextResponse.json({ success: false, message: "Server configuration error" }, { status: 500 });
    }

    const token = jwt.sign({ email, id: provider._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: `${TOKEN_MAX_AGE}s`,
    });

    const response = NextResponse.json({
      success: true,
      message: "OTP verified successfully",
      provider: sanitizeProvider(provider),
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

    await Otp.deleteMany({ email });

    return response;
  } catch (err) {
    console.error("Error verifying OTP:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
