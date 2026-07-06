import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/connectDB";
import OTP from "@/models/Otp";
import ServiceProvider from "@/models/ServiceProvider";
import { applyRedisRateLimit, redisAuthRateLimiter } from "@/lib/redisRateLimiter";

export async function POST(req) {
  try {
    await connectDB();

    const rateLimitResult = await applyRedisRateLimit(req, redisAuthRateLimiter);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { message: rateLimitResult.message },
        { status: 429, headers: { 'Retry-After': rateLimitResult.retryAfter.toString() } }
      );
    }

    const { email, otp } = await req.json();

    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) {
      return NextResponse.json({ message: "OTP not found or expired" }, { status: 400 });
    }

    if (otpRecord.otp !== otp) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    const user = await ServiceProvider.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Delete OTP after verification
    await OTP.deleteOne({ email });

    return NextResponse.json({ message: "Login successful", token });
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
