import crypto from "crypto";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Otp from "@/models/Otp";
import ServiceProvider from "@/models/ServiceProvider";
import Homeowner from "@/models/Homeowner";
import { verifyOTPViaMSG91, detectInputType, formatPhoneNumber } from "@/lib/msg91";
import { isTestUser, getTestOTP, isTestMode, getTestUser } from "@/config/testUsers";

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000;
const TOKEN_COOKIE_NAME = "yann_session";
const TOKEN_MAX_AGE = 30 * 24 * 60 * 60; // 30 days (improved from 1 hour for better UX)

/**
 * Normalize phone number to 10 digits for storage
 */
function normalizePhone(phone) {
  if (!phone) return '';
  const cleaned = phone.toString().replace(/\D/g, '');
  return cleaned.slice(-10);
}

const sanitizeProvider = (provider) => ({
  id: provider._id.toString(),
  _id: provider._id.toString(), // Add for mobile app compatibility
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
  isVerified: provider.isVerified || false,
  aadhaarVerified: provider.aadhaarVerified || false,
  isOnline: provider.isOnline ?? true,
});

const sanitizeHomeowner = (homeowner) => ({
  id: homeowner._id.toString(),
  _id: homeowner._id.toString(), // Add for mobile app compatibility
  name: homeowner.name,
  email: homeowner.email,
  phone: homeowner.phone || "",
  avatar: homeowner.avatar || "",
  preferences: homeowner.preferences || [],
  savedProviders: homeowner.savedProviders || [],
  addressBook: homeowner.addressBook || [],
  isVerified: homeowner.isVerified || false,
  aadhaarVerified: homeowner.aadhaarVerified || false,
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

    // Support both 'identifier' (new) and 'email' (legacy) field names
    const rawIdentifier = (payload?.identifier || payload?.email || '').trim();
    const otp = payload?.otp?.toString().trim();

    if (!rawIdentifier || !otp) {
      return NextResponse.json({ success: false, message: "Email/Phone and OTP are required" }, { status: 400 });
    }

    // Detect if input is email or phone
    const inputType = detectInputType(rawIdentifier);

    if (!inputType) {
      return NextResponse.json({
        success: false,
        message: "Please enter a valid email address or phone number"
      }, { status: 400 });
    }

    const isPhoneLogin = inputType === 'phone';
    const email = isPhoneLogin ? null : rawIdentifier.toLowerCase();
    const phone = isPhoneLogin ? normalizePhone(rawIdentifier) : null;

    const requestedAudience = payload?.audience === "homeowner" ? "homeowner" : "provider";
    const rawIntent = payload?.intent === "signup" ? "signup" : "login";
    const intent = requestedAudience === "provider" ? "login" : rawIntent;

    // Google Play review bypass
    if (email === 'review@yannhome.app' && otp === '123456') {
      // Find or create the review user
      let homeowner = await Homeowner.findOne({ email: 'review@yannhome.app' });

      if (!homeowner) {
        homeowner = await Homeowner.create({
          name: 'Google Play Reviewer',
          email: 'review@yannhome.app',
          phone: '',
          preferences: [],
        });
      }

      homeowner.lastLoginAt = new Date();
      await homeowner.save();

      const token = jwt.sign(
        { email: homeowner.email, id: homeowner._id.toString(), audience: "homeowner" },
        process.env.JWT_SECRET,
        { expiresIn: `${TOKEN_MAX_AGE}s` }
      );

      const response = NextResponse.json({
        success: true,
        message: "OTP verified successfully",
        homeowner: sanitizeHomeowner(homeowner),
        audience: "homeowner",
        token: token,
      });

      const isProduction = process.env.NODE_ENV === "production";
      response.cookies.set({
        name: "yann_home_session",
        value: token,
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: TOKEN_MAX_AGE,
        path: "/",
      });

      return response;
    }

    // Build query based on identifier type
    const otpQuery = isPhoneLogin
      ? { phone: phone, audience: requestedAudience }
      : { email: email, audience: requestedAudience };

    const otpDoc = await Otp.findOne(otpQuery);

    if (!otpDoc) {
      return NextResponse.json({ success: false, message: "OTP not found or expired" }, { status: 400 });
    }

    const now = new Date();
    const ipHeader = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const requesterIp = ipHeader.split(",")[0].trim();

    if (otpDoc.blockedUntil && otpDoc.blockedUntil > now) {
      return NextResponse.json({ success: false, message: "Too many invalid attempts. Try again later." }, { status: 429 });
    }

    if (!otpDoc.expiresAt || otpDoc.expiresAt <= now) {
      await Otp.deleteMany(otpQuery);
      return NextResponse.json({ success: false, message: "OTP expired" }, { status: 400 });
    }

    // Verify OTP based on identifier type
    let isOtpValid = false;

    if (isPhoneLogin) {
      // Check if this is a test user
      const isTest = isTestUser(rawIdentifier);

      if (isTest && otpDoc.msg91RequestId === 'TEST_MODE') {
        // Test user - verify using hash instead of MSG91
        console.log(`🧪 Test mode: Verifying OTP via hash for ${phone}`);
        const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
        isOtpValid = hashedOtp === otpDoc.otpHash;
      } else {
        // Real user - verify via MSG91
        const msg91Result = await verifyOTPViaMSG91(phone, otp);
        isOtpValid = msg91Result.success;
      }

      if (!isOtpValid) {
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
        const message = attempts >= MAX_ATTEMPTS ? "Too many invalid attempts. Try again later." : msg91Result.message || "Invalid OTP";

        return NextResponse.json({ success: false, message }, { status });
      }
    } else {
      // Verify via hash for email OTP
      const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
      isOtpValid = hashedOtp === otpDoc.otpHash;

      if (!isOtpValid) {
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
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT secret is not configured");
      return NextResponse.json({ success: false, message: "Server configuration error" }, { status: 500 });
    }

    if (requestedAudience === "provider") {
      // Find provider by email or phone - search both for flexibility
      let provider;
      if (isPhoneLogin) {
        provider = await ServiceProvider.findOne({
          $or: [{ phone: phone }, { email: phone }]
        });
      } else {
        provider = await ServiceProvider.findOne({
          $or: [{ email: email }, { phone: email }]
        });
      }

      if (!provider) {
        if (isTestUser(rawIdentifier)) {
          // Auto-create test provider
          try {
            const testUser = getTestUser(rawIdentifier);
            if (!testUser) throw new Error("Test user not found in config");

            provider = await ServiceProvider.create({
              name: testUser.name,
              email: testUser.email,
              phone: normalizePhone(testUser.phone),
              services: testUser.services || [],
              workingHours: testUser.workingHours || { startTime: '09:00', endTime: '18:00' },
              experience: 5, // Default experience for test users
              isVerified: true,
              status: 'active',
              isOnline: true
            });
          } catch (createError) {
            console.error("Test provider creation failed:", createError);
            return NextResponse.json({ success: false, message: "Failed to create test provider: " + createError.message }, { status: 500 });
          }
        } else {
          await Otp.deleteMany(otpQuery);
          return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }
      }

      const tokenPayload = isPhoneLogin
        ? { phone: provider.phone, id: provider._id.toString(), audience: "provider" }
        : { email: provider.email, id: provider._id.toString(), audience: "provider" };

      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
        expiresIn: `${TOKEN_MAX_AGE}s`,
      });

      const response = NextResponse.json({
        success: true,
        message: "OTP verified successfully",
        provider: sanitizeProvider(provider),
        audience: "provider",
        token: token, // Include token for mobile app
      });

      // Set cookie with proper settings for website
      const isProduction = process.env.NODE_ENV === "production";
      response.cookies.set({
        name: TOKEN_COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: TOKEN_MAX_AGE,
        path: "/",
      });

      await Otp.deleteMany(otpQuery);

      return response;
    }

    // Homeowner login/signup - search by both email and phone for flexibility
    let homeowner;
    if (isPhoneLogin) {
      homeowner = await Homeowner.findOne({
        $or: [{ phone: phone }, { email: phone }]
      });
    } else {
      homeowner = await Homeowner.findOne({
        $or: [{ email: email }, { phone: email }]
      });
    }

    if (!homeowner) {
      if (intent !== "signup") {
        if (isTestUser(rawIdentifier)) {
          // Auto-create test homeowner for login intent
          try {
            const testUser = getTestUser(rawIdentifier);
            if (!testUser) throw new Error("Test user not found in config");

            homeowner = await Homeowner.create({
              name: testUser.name,
              email: testUser.email,
              phone: normalizePhone(testUser.phone),
              isVerified: true
            });
          } catch (createError) {
            console.error("Test homeowner creation failed:", createError);
            return NextResponse.json({ success: false, message: "Failed to create test resident: " + createError.message }, { status: 500 });
          }
        } else {
          await Otp.deleteMany(otpQuery);
          return NextResponse.json({ success: false, message: "Resident account not found" }, { status: 404 });
        }
      }


      // If homeowner is still not found (e.g. signup intent, or not a test user), proceed with creation
      if (!homeowner) {
        const nameFromMetadata = otpDoc.metadata?.name;
        if (!nameFromMetadata || typeof nameFromMetadata !== "string") {
          return NextResponse.json({ success: false, message: "Unable to create resident account" }, { status: 400 });
        }

        // Create new homeowner with phone or email based on login type
        const homeownerData = {
          name: nameFromMetadata.trim(),
          preferences: Array.isArray(otpDoc.metadata?.preferences) ? otpDoc.metadata.preferences : [],
        };

        if (isPhoneLogin) {
          homeownerData.phone = phone;
          // If email is provided in metadata, use it
          if (otpDoc.metadata?.email) {
            homeownerData.email = otpDoc.metadata.email.toLowerCase().trim();
          }
        } else {
          homeownerData.email = email;
          // If phone is provided in metadata, use it
          if (otpDoc.metadata?.phone) {
            homeownerData.phone = normalizePhone(otpDoc.metadata.phone);
          }
        }

        homeowner = await Homeowner.create(homeownerData);
      } // End of second !homeowner check
    }

    homeowner.lastLoginAt = new Date();
    await homeowner.save();

    const tokenPayload = {
      id: homeowner._id.toString(),
      audience: "homeowner",
    };

    // Include both email and phone in token if available
    if (homeowner.email) tokenPayload.email = homeowner.email;
    if (homeowner.phone) tokenPayload.phone = homeowner.phone;

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: `${TOKEN_MAX_AGE}s`,
    });

    console.log('🔑 Generated homeowner token:', {
      tokenLength: token?.length,
      hasToken: !!token,
      tokenPreview: token?.substring(0, 20) + '...',
      userId: homeowner._id.toString()
    });

    const response = NextResponse.json({
      success: true,
      message: intent === "signup" ? "Resident account created" : "OTP verified successfully",
      homeowner: sanitizeHomeowner(homeowner),
      audience: "homeowner",
      token: token, // Include token for mobile app
    });

    // Set cookie with proper settings for website
    const isProduction = process.env.NODE_ENV === "production";
    response.cookies.set({
      name: "yann_home_session",
      value: token,
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: TOKEN_MAX_AGE,
      path: "/",
    });

    await Otp.deleteMany(otpQuery);

    return response;
  } catch (err) {
    console.error("Error verifying OTP:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

