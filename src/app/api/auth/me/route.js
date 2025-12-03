import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import ServiceProvider from "@/models/ServiceProvider";

const TOKEN_COOKIE_NAME = "yann_session";

const clearSessionResponse = (message) => {
  const response = NextResponse.json({ success: false, message }, { status: 401 });
  response.cookies.set({
    name: TOKEN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    expires: new Date(0),
    path: "/",
  });
  return response;
};

const sanitizeProvider = (provider) => ({
  _id: provider._id.toString(),
  id: provider._id.toString(),
  name: provider.name,
  email: provider.email,
  services: provider.services,
  serviceRates: provider.serviceRates || [],
  selectedCategories: provider.selectedCategories || [],
  status: provider.status,
  rating: provider.rating,
  totalReviews: provider.totalReviews,
  experience: provider.experience,
  phone: provider.phone,
  workingHours: provider.workingHours || null,
  profileImage: provider.profileImage || '',
  pendingServiceRequest: provider.pendingServiceRequest || null,
});

export async function GET() {
  try {
    await connectDB();

    const token = cookies().get(TOKEN_COOKIE_NAME)?.value;

    if (!token) {
      return clearSessionResponse("Session not found");
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT secret is not configured");
      return NextResponse.json({ success: false, message: "Server configuration error" }, { status: 500 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      console.error("Error verifying token:", error);
      return clearSessionResponse("Invalid or expired session");
    }

    if (decoded?.audience && decoded.audience !== "provider") {
      return clearSessionResponse("Invalid session scope");
    }

    const provider = await ServiceProvider.findOne({ email: decoded.email });

    if (!provider) {
      return clearSessionResponse("User not found");
    }

    return NextResponse.json({ success: true, provider: sanitizeProvider(provider) });
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json({ success: false, message: "Unable to fetch session" }, { status: 500 });
  }
}
