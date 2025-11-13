import crypto from "crypto";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import ServiceProvider from "@/models/ServiceProvider";
import Homeowner from "@/models/Homeowner";
import Otp from "@/models/Otp";

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const MIN_RESEND_INTERVAL_MS = 60 * 1000;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const MAX_SEND_PER_WINDOW = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000;

const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/;

const COMPANY_NAME = "YANN Home Services";
const COMPANY_SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@yannservices.com";
const COMPANY_WEBSITE = process.env.NEXT_PUBLIC_APP_URL || "https://yann-care.vercel.app";
const COMPANY_ADDRESS = process.env.COMPANY_ADDRESS || "YANN Services, Gurugram, India";

const buildOtpEmail = (otpCode, recipientName = "", { audience = "provider", intent = "login" } = {}) => {
  const safeName = recipientName ? recipientName.trim() : "";
  const greetingName = safeName ? safeName.split(" ")[0] : "there";
  const audienceLabel = audience === "homeowner" ? "Resident" : "Partner";
  const intentCopy = intent === "signup" ? "complete your new account setup" : "sign in securely";
  const headline = audience === "homeowner" ? 'Resident access verification' : 'Partner login verification';
  const supportingCopy = audience === "homeowner"
    ? "Use this verification code to manage your bookings, track requests, and connect with verified home service experts."
    : "Use this verification code to manage your services, track bookings, and stay connected with your clients.";

  const text = [
    `${COMPANY_NAME} ${audienceLabel} Verification`,
    ``,
    `Hello ${greetingName},`,
    ``,
    `Your one-time password is: ${otpCode}`,
    `This code will expire in 10 minutes. Use it to ${intentCopy}.`,
    `If you did not request this, please ignore this email.`,
    ``,
    `Warm regards,`,
    `${COMPANY_NAME}`,
    `Need help? Contact ${COMPANY_SUPPORT_EMAIL}`,
  ].join("\n");

  const html = `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${COMPANY_NAME} OTP</title>
      <style>
        body { margin: 0; padding: 0; background-color: #f5f7fb; font-family: 'Segoe UI', Arial, sans-serif; color: #1f2933; }
        a { color: #2563eb; text-decoration: none; }
      </style>
    </head>
    <body>
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f5f7fb; padding: 24px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.15);">
              <tr>
                <td style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 32px;">
                  <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px;">${COMPANY_NAME}</h1>
                  <p style="margin: 8px 0 0; font-size: 16px; color: rgba(255, 255, 255, 0.85); text-transform: uppercase; letter-spacing: 0.4px;">${audienceLabel} verification</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 32px 40px;">
                  <p style="margin: 0 0 16px; font-size: 18px; font-weight: 600;">Hello ${greetingName},</p>
                  <p style="margin: 0 0 12px; text-transform: uppercase; font-size: 13px; font-weight: 700; letter-spacing: 1px; color: #6366f1;">${headline}</p>
                  <p style="margin: 0 0 16px; line-height: 1.6; font-size: 15px; color: #4b5563;">
                    ${supportingCopy} This code is valid for the next <strong>10 minutes</strong>.
                  </p>
                  <div style="margin: 24px 0; text-align: center;">
                    <div style="display: inline-block; padding: 16px 32px; border-radius: 12px; background: linear-gradient(135deg, #2563eb, #7c3aed); color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: 6px;">
                      ${otpCode}
                    </div>
                  </div>
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin: 24px 0;">
                    <tr>
                      <td style="background-color: #f8fafc; border-radius: 12px; padding: 20px;">
                        <p style="margin: 0 0 12px; font-size: 15px; font-weight: 600; color: #1f2937;">What happens next?</p>
                        <ul style="margin: 0; padding-left: 20px; line-height: 1.6; color: #4b5563;">
                          <li>Enter this code on the login screen to verify your identity.</li>
                          <li>Do not share this code with anyone. Our team will never ask for it.</li>
                          <li>If you did not request a code, please ignore this email.</li>
                        </ul>
                      </td>
                    </tr>
                  </table>
                  <p style="margin: 0 0 16px; font-size: 15px; color: #4b5563;">
                    Need help? Reach us anytime at <a href="mailto:${COMPANY_SUPPORT_EMAIL}">${COMPANY_SUPPORT_EMAIL}</a>.
                  </p>
                  <p style="margin: 0; font-size: 15px; color: #4b5563;">Warm regards,<br/><strong>${COMPANY_NAME}</strong></p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #0f172a; padding: 20px 32px; text-align: center;">
                  <p style="margin: 0 0 8px; font-size: 13px; color: rgba(148, 163, 184, 0.9);">${COMPANY_NAME}</p>
                  <p style="margin: 0 0 8px; font-size: 12px; color: rgba(148, 163, 184, 0.75);">${COMPANY_ADDRESS}</p>
                  <p style="margin: 0; font-size: 12px;">
                    <a href="${COMPANY_WEBSITE}" style="color: rgba(96, 165, 250, 0.95);">Visit our website</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;

  const subject = audience === "homeowner"
    ? `Your Resident Access Code | ${COMPANY_NAME}`
    : `Your Partner Verification Code | ${COMPANY_NAME}`;

  return { text, html, subject };
};

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
    const requestedAudience = payload?.audience === "homeowner" ? "homeowner" : "provider";
    const rawIntent = payload?.intent === "signup" ? "signup" : "login";
    const intent = requestedAudience === "provider" ? "login" : rawIntent;
    const metadata = payload?.metadata && typeof payload.metadata === "object" ? payload.metadata : {};

    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ success: false, message: "Valid email is required" }, { status: 400 });
    }

    let audienceName = "";
    let recipientName = "";

    if (requestedAudience === "provider") {
      const user = await ServiceProvider.findOne({ email });
      if (!user) {
        return NextResponse.json({ success: false, message: "Email not registered as a partner" }, { status: 404 });
      }
      audienceName = "provider";
      recipientName = user?.name || "";
    } else {
      const homeowner = await Homeowner.findOne({ email });
      audienceName = "homeowner";

      if (intent === "login") {
        if (!homeowner) {
          return NextResponse.json({ success: false, message: "We could not find a resident account with this email" }, { status: 404 });
        }
        recipientName = homeowner?.name || "";
      } else {
        if (homeowner) {
          return NextResponse.json({ success: false, message: "An account already exists with this email. Try logging in." }, { status: 409 });
        }
        if (!metadata?.name || typeof metadata.name !== "string") {
          return NextResponse.json({ success: false, message: "Please share your name to create the account" }, { status: 400 });
        }
        recipientName = metadata.name;
      }
    }

    const ipHeader = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const requesterIp = ipHeader.split(",")[0].trim();
    const now = new Date();

    const existingOtp = await Otp.findOne({ email, audience: audienceName });

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
      { email, audience: audienceName },
      {
        $set: {
          email,
          audience: audienceName,
          intent,
          metadata,
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
    const { text, html, subject } = buildOtpEmail(otpCode, recipientName, {
      audience: audienceName,
      intent,
    });

    await transporter.sendMail({
      from: `${COMPANY_NAME} <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      text,
      html,
      replyTo: COMPANY_SUPPORT_EMAIL,
    });

    const humanAudience = audienceName === "homeowner" ? "resident" : "partner";
    return NextResponse.json({ success: true, message: `OTP sent successfully for your ${humanAudience} account` });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return NextResponse.json({ success: false, message: "Unable to send OTP" }, { status: 500 });
  }
}
