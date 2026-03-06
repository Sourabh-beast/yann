import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Homeowner from "@/models/Homeowner";

const HOME_COOKIE = "yann_home_session";

const clearHomeSession = (message) => {
  const isProduction = process.env.NODE_ENV === "production";
  const response = NextResponse.json({ success: false, message }, { status: 401 });
  response.cookies.set({
    name: HOME_COOKIE,
    value: "",
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 0,
    expires: new Date(0),
    path: "/",
  });
  return response;
};

const sanitizeHomeowner = (homeowner) => ({
  id: homeowner._id.toString(),
  name: homeowner.name,
  email: homeowner.email,
  phone: homeowner.phone || "",
  avatar: homeowner.avatar || homeowner.profileImage || "",
  profileImage: homeowner.profileImage || homeowner.avatar || "",
  preferences: homeowner.preferences || [],
  savedProviders: homeowner.savedProviders || [],
  addressBook: homeowner.addressBook || [],
  isVerified: homeowner.isVerified || false,
  aadhaarVerified: homeowner.aadhaarVerified || false,
  aadhaarVerifiedAt: homeowner.aadhaarVerifiedAt || null,
});

export async function GET(request) {
  try {
    await connectDB();

    // Try to get token from cookie first (for web)
    const cookieStore = await cookies();
    let token = cookieStore.get(HOME_COOKIE)?.value;

    // If no cookie, try Authorization header (for mobile)
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return clearHomeSession("Session not found");
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT secret is not configured");
      return NextResponse.json({ success: false, message: "Server configuration error" }, { status: 500 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      console.error("Error verifying resident token:", error);
      return clearHomeSession("Invalid or expired session");
    }

    if (decoded?.audience !== "homeowner") {
      return clearHomeSession("Invalid session scope");
    }

    const homeowner = await Homeowner.findById(decoded.id);
    if (!homeowner) {
      return clearHomeSession("Resident not found");
    }

    return NextResponse.json({ success: true, homeowner: sanitizeHomeowner(homeowner) });
  } catch (error) {
    console.error("Error fetching resident session:", error);
    return NextResponse.json({ success: false, message: "Unable to fetch session" }, { status: 500 });
  }
}
