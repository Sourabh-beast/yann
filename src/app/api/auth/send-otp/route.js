import crypto from "crypto";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import ServiceProvider from "@/models/ServiceProvider";
import Otp from "@/models/Otp";

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const MIN_RESEND_INTERVAL_MS = 60 * 1000;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const MAX_SEND_PER_WINDOW = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000;

const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/;

const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error("Email credentials are not configured");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
};

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

    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ success: false, message: "Valid email is required" }, { status: 400 });
    }

    const user = await ServiceProvider.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, message: "Email not registered" }, { status: 404 });
    }

    const ipHeader = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const requesterIp = ipHeader.split(",")[0].trim();
    const now = new Date();

    const existingOtp = await Otp.findOne({ email });

    if (existingOtp?.blockedUntil && existingOtp.blockedUntil > now) {
      return NextResponse.json({ success: false, message: "Too many attempts. Try again later." }, { status: 429 });
    }

    if (existingOtp?.lastSentAt && now.getTime() - existingOtp.lastSentAt.getTime() < MIN_RESEND_INTERVAL_MS) {
      return NextResponse.json({ success: false, message: "Please wait before requesting another OTP" }, { status: 429 });
    }

    let windowStartedAt = existingOtp?.windowStartedAt || existingOtp?.createdAt || now;
    let sendCount = existingOtp?.sendCount || 0;

    if (now.getTime() - windowStartedAt.getTime() >= RATE_LIMIT_WINDOW_MS) {
      windowStartedAt = now;
      sendCount = 0;
    }

    if (sendCount >= MAX_SEND_PER_WINDOW) {
      const blockedUntil = new Date(now.getTime() + BLOCK_DURATION_MS);
      existingOtp.blockedUntil = blockedUntil;
      existingOtp.sendCount = sendCount;
      existingOtp.lastRequestIp = requesterIp;
      existingOtp.windowStartedAt = windowStartedAt;
      existingOtp.lastSentAt = existingOtp.lastSentAt || now;
      await existingOtp.save();

      return NextResponse.json({ success: false, message: "Too many OTP requests. Try again later." }, { status: 429 });
    }

    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const otpHash = crypto.createHash("sha256").update(otpCode).digest("hex");
    const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MS);

    await Otp.findOneAndUpdate(
      { email },
      {
        $set: {
          email,
          otpHash,
          expiresAt,
          attempts: 0,
          sendCount: sendCount + 1,
          windowStartedAt,
          lastSentAt: now,
          lastRequestIp: requesterIp,
        },
        $unset: { blockedUntil: "" },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const transporter = createTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Login OTP - Yann Services",
  text: `Your OTP is ${otpCode}. It is valid for 10 minutes.`,
    });

    return NextResponse.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return NextResponse.json({ success: false, message: "Unable to send OTP" }, { status: 500 });
  }
}
