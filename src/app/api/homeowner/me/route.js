import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Homeowner from "@/models/Homeowner";

const HOME_COOKIE = "yann_home_session";

const clearHomeSession = (message) => {
  const response = NextResponse.json({ success: false, message }, { status: 401 });
  response.cookies.set({
    name: HOME_COOKIE,
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

const sanitizeHomeowner = (homeowner) => ({
  id: homeowner._id.toString(),
  name: homeowner.name,
  email: homeowner.email,
  phone: homeowner.phone || "",
  avatar: homeowner.avatar || "",
  preferences: homeowner.preferences || [],
  savedProviders: homeowner.savedProviders || [],
  addressBook: homeowner.addressBook || [],
});

export async function GET() {
  try {
    await connectDB();

    const token = cookies().get(HOME_COOKIE)?.value;
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

    const homeowner = await Homeowner.findOne({ email: decoded.email });
    if (!homeowner) {
      return clearHomeSession("Resident not found");
    }

    return NextResponse.json({ success: true, homeowner: sanitizeHomeowner(homeowner) });
  } catch (error) {
    console.error("Error fetching resident session:", error);
    return NextResponse.json({ success: false, message: "Unable to fetch session" }, { status: 500 });
  }
}
