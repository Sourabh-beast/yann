import nodemailer from "nodemailer";
import connectDB from "@/lib/connectDB";
import ServiceProvider from "@/models/ServiceProvider";
import Otp from "@/models/Otp";
import dotenv from "dotenv";

dotenv.config();

export async function POST(req) {
  try {
    await connectDB();

    const { email } = await req.json();

    if (!email) {
      return Response.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    // ✅ Check if email exists in registered service providers
    const user = await ServiceProvider.findOne({ email });
    if (!user) {
      return Response.json({ success: false, message: "Email not registered" }, { status: 400 });
    }

    // ✅ Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ✅ Save or update OTP
    await Otp.findOneAndUpdate(
      { email },
      { email, otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // ✅ Setup email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ✅ Send mail
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Login OTP - Yann Services",
      text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    return Response.json({ success: true, message: "OTP sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return Response.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
