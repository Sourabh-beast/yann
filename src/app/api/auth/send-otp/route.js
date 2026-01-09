import crypto from "crypto";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import ServiceProvider from "@/models/ServiceProvider";
import Homeowner from "@/models/Homeowner";
import Otp from "@/models/Otp";
import {
  sendOTPViaMSG91,
  formatPhoneNumber,
  isPhoneNumber,
  isEmail,
  detectInputType
} from "@/lib/msg91";
import { isTestUser, getTestOTP, isTestMode, getTestUser } from "@/config/testUsers";
import { applyRateLimit, otpRateLimiter } from "@/lib/rateLimiter";

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

/**
 * Normalize phone number to 10 digits for storage
 */
function normalizePhone(phone) {
  if (!phone) return '';
  const cleaned = phone.toString().replace(/\D/g, '');
  return cleaned.slice(-10);
}

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
    console.error("❌ Email credentials not configured. EMAIL_USER or EMAIL_PASS missing.");
    throw new Error("Email service is not configured. Please contact support.");
  }

  console.log(`✅ Email transporter configured with user: ${user}`);

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
};

export async function POST(req) {
  try {
    await connectDB();

    // Apply rate limiting to prevent OTP abuse
    const rateLimitResult = applyRateLimit(req, otpRateLimiter);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, message: rateLimitResult.message },
        {
          status: 429,
          headers: { 'Retry-After': rateLimitResult.retryAfter.toString() }
        }
      );
    }

    let payload;
    try {
      payload = await req.json();
    } catch (err) {
      return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 });
    }

    // Support both 'identifier' (new) and 'email' (legacy) field names
    const rawIdentifier = (payload?.identifier || payload?.email || '').trim();
    const requestedAudience = payload?.audience === "homeowner" ? "homeowner" : "provider";
    const rawIntent = payload?.intent === "signup" ? "signup" : "login";
    const intent = requestedAudience === "provider" ? "login" : rawIntent;
    const metadata = payload?.metadata && typeof payload.metadata === "object" ? payload.metadata : {};

    if (!rawIdentifier) {
      return NextResponse.json({ success: false, message: "Email or phone number is required" }, { status: 400 });
    }

    // Detect if input is email or phone
    const inputType = detectInputType(rawIdentifier);

    if (!inputType) {
      return NextResponse.json({
        success: false,
        message: "Please enter a valid email address or 10-digit phone number"
      }, { status: 400 });
    }

    const isPhoneLogin = inputType === 'phone';
    const email = isPhoneLogin ? null : rawIdentifier.toLowerCase();
    const phone = isPhoneLogin ? normalizePhone(rawIdentifier) : null;

    // Google Play review bypass - skip for phone login
    if (email === 'review@yannhome.app') {
      return NextResponse.json({
        success: true,
        message: 'OTP sent successfully for your resident account',
        identifierType: 'email'
      });
    }

    let audienceName = "";
    let recipientName = "";

    if (requestedAudience === "provider") {
      // For providers, check by email or phone
      let user;
      if (isPhoneLogin) {
        user = await ServiceProvider.findOne({ phone: phone });
        if (!user) {
          if (isTestUser(rawIdentifier)) {
            // Allow test user to proceed
            const testUser = getTestUser(rawIdentifier);
            recipientName = testUser ? testUser.name : "Test Provider";
          } else {
            return NextResponse.json({ success: false, message: "Phone number not registered as a partner" }, { status: 404 });
          }
        }
      } else {
        user = await ServiceProvider.findOne({ email });
        if (!user) {
          if (isTestUser(rawIdentifier)) {
            // Allow test user to proceed
            const testUser = getTestUser(rawIdentifier);
            recipientName = testUser ? testUser.name : "Test Provider";
          } else {
            return NextResponse.json({ success: false, message: "Email not registered as a partner" }, { status: 404 });
          }
        }
      }
      audienceName = "provider";
      recipientName = user?.name || recipientName || "";
    } else {
      // For homeowners
      audienceName = "homeowner";

      if (isPhoneLogin) {
        // Phone-based login/signup - search by phone OR email for flexibility
        const homeowner = await Homeowner.findOne({
          $or: [{ phone: phone }, { email: phone }]
        });

        if (intent === "login") {
          if (!homeowner) {
            if (isTestUser(rawIdentifier)) {
              // Allow test user to proceed
              const testUser = getTestUser(rawIdentifier);
              recipientName = testUser ? testUser.name : "Test Resident";
            } else {
              return NextResponse.json({
                success: false,
                message: "We could not find a resident account with this phone number"
              }, { status: 404 });
            }
          }
          recipientName = homeowner?.name || recipientName || "";
        } else {
          // Signup with phone
          if (homeowner) {
            return NextResponse.json({
              success: false,
              message: "An account already exists with this phone number. Try logging in."
            }, { status: 409 });
          }
          if (!metadata?.name || typeof metadata.name !== "string") {
            return NextResponse.json({
              success: false,
              message: "Please share your name to create the account"
            }, { status: 400 });
          }
          recipientName = metadata.name;
        }
      } else {
        // Email-based login/signup - search by email OR phone for flexibility
        const homeowner = await Homeowner.findOne({
          $or: [{ email: email }, { phone: email }]
        });

        if (intent === "login") {
          if (!homeowner) {
            if (isTestUser(rawIdentifier)) {
              // Allow test user to proceed
              const testUser = getTestUser(rawIdentifier);
              recipientName = testUser ? testUser.name : "Test Resident";
            } else {
              return NextResponse.json({
                success: false,
                message: "We could not find a resident account with this email"
              }, { status: 404 });
            }
          }
          recipientName = homeowner?.name || recipientName || "";
        } else {
          if (homeowner) {
            return NextResponse.json({
              success: false,
              message: "An account already exists with this email. Try logging in."
            }, { status: 409 });
          }
          if (!metadata?.name || typeof metadata.name !== "string") {
            return NextResponse.json({
              success: false,
              message: "Please share your name to create the account"
            }, { status: 400 });
          }
          recipientName = metadata.name;
        }
      }
    }

    const ipHeader = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const requesterIp = ipHeader.split(",")[0].trim();
    const now = new Date();

    // Build query based on identifier type
    const otpQuery = isPhoneLogin
      ? { phone: phone, audience: audienceName }
      : { email: email, audience: audienceName };

    const existingOtp = await Otp.findOne(otpQuery);

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
      if (existingOtp) {
        existingOtp.blockedUntil = blockedUntil;
        existingOtp.sendCount = sendCount;
        existingOtp.lastRequestIp = requesterIp;
        existingOtp.windowStartedAt = windowStartedAt;
        existingOtp.lastSentAt = existingOtp.lastSentAt || now;
        await existingOtp.save();
      }
      return NextResponse.json({ success: false, message: "Too many OTP requests. Try again later." }, { status: 429 });
    }

    const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MS);

    if (isPhoneLogin) {
      // Check if this is a test user
      const testOTP = getTestOTP(rawIdentifier);

      if (testOTP) {
        // Test user - skip MSG91 and use predefined OTP
        console.log(`🧪 Test mode: Using predefined OTP for ${phone}`);

        const otpHash = crypto.createHash("sha256").update(testOTP).digest("hex");

        await Otp.findOneAndUpdate(
          { phone: phone, audience: audienceName },
          {
            $set: {
              phone: phone,
              email: null,
              identifierType: 'phone',
              audience: audienceName,
              intent,
              metadata,
              otpHash,
              msg91RequestId: 'TEST_MODE',
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

        return NextResponse.json({
          success: true,
          message: `OTP sent to your phone number (Test Mode)`,
          identifierType: 'phone',
          testMode: true
        });
      }

      // Send OTP via MSG91 for real users
      const msg91Result = await sendOTPViaMSG91(phone);

      if (!msg91Result.success) {
        return NextResponse.json({
          success: false,
          message: msg91Result.message || "Failed to send OTP"
        }, { status: 500 });
      }

      // Store OTP record for phone (MSG91 handles OTP generation and verification)
      await Otp.findOneAndUpdate(
        { phone: phone, audience: audienceName },
        {
          $set: {
            phone: phone,
            email: null,
            identifierType: 'phone',
            audience: audienceName,
            intent,
            metadata,
            otpHash: null, // MSG91 handles OTP
            msg91RequestId: msg91Result.requestId,
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

      const humanAudience = audienceName === "homeowner" ? "resident" : "partner";
      return NextResponse.json({
        success: true,
        message: `OTP sent to your phone number`,
        identifierType: 'phone'
      });
    } else {
      // Send OTP via Email
      const otpCode = crypto.randomInt(100000, 1000000).toString();
      const otpHash = crypto.createHash("sha256").update(otpCode).digest("hex");

      await Otp.findOneAndUpdate(
        { email: email, audience: audienceName },
        {
          $set: {
            email,
            phone: null,
            identifierType: 'email',
            audience: audienceName,
            intent,
            metadata,
            otpHash,
            msg91RequestId: null,
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

      // Send email with OTP
      try {
        const transporter = createTransporter();
        const { text, html, subject } = buildOtpEmail(otpCode, recipientName, {
          audience: audienceName,
          intent,
        });

        console.log(`📧 Sending OTP email to: ${email} for ${audienceName} ${intent}`);

        await transporter.sendMail({
          from: `${COMPANY_NAME} <${process.env.EMAIL_USER}>`,
          to: email,
          subject,
          text,
          html,
          replyTo: COMPANY_SUPPORT_EMAIL,
        });

        console.log(`✅ OTP email sent successfully to: ${email}`);
      } catch (emailError) {
        console.error("❌ Email sending failed:", emailError);
        // Delete the OTP record since email failed
        await Otp.deleteOne({ email: email, audience: audienceName });

        return NextResponse.json({
          success: false,
          message: "Failed to send OTP email. Please check your email address or try again later.",
          error: process.env.NODE_ENV === 'development' ? emailError.message : undefined
        }, { status: 500 });
      }

      const humanAudience = audienceName === "homeowner" ? "resident" : "partner";
      return NextResponse.json({
        success: true,
        message: `OTP sent successfully to your email`,
        identifierType: 'email'
      });
    }
  } catch (error) {
    console.error("Send OTP Error:", error);
    return NextResponse.json({ success: false, message: "Unable to send OTP" }, { status: 500 });
  }
}
