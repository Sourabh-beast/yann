import connectDB from "@/lib/connectDB";
import Otp from "@/models/Otp";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export async function POST(req) {
  try {
    await connectDB();

    const { email, otp } = await req.json();

    if (!email || !otp) {
      return new Response(
        JSON.stringify({ message: "Email and OTP are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const otpDoc = await Otp.findOne({ email }).sort({ createdAt: -1 });

    if (!otpDoc) {
      return new Response(JSON.stringify({ message: "OTP not found" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ Convert both to strings to avoid mismatch
    if (String(otpDoc.otp) !== String(otp)) {
      return new Response(JSON.stringify({ message: "Invalid OTP" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ Check expiry (if you store expiry in model)
    if (otpDoc.expiresAt && otpDoc.expiresAt < Date.now()) {
      await Otp.deleteMany({ email });
      return new Response(JSON.stringify({ message: "OTP expired" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ Generate JWT Token
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    if (!token) {
      return new Response(
        JSON.stringify({ message: "Failed to generate token" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // ✅ Delete used OTP
    await Otp.deleteMany({ email });

    // ✅ Return success
    return new Response(
      JSON.stringify({
        message: "OTP verified successfully",
        token,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error verifying OTP:", err);
    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
