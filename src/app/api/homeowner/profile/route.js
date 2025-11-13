import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/connectDB";
import Homeowner from "@/models/Homeowner";

const HOME_COOKIE = "yann_home_session";

const sanitizeHomeowner = (homeowner) => ({
  id: homeowner._id.toString(),
  name: homeowner.name,
  email: homeowner.email,
  phone: homeowner.phone || "",
  avatar: homeowner.avatar || "",
  preferences: homeowner.preferences || [],
  addressBook: homeowner.addressBook || [],
});

async function resolveHomeowner() {
  if (!process.env.JWT_SECRET) {
    console.error("JWT secret is not configured");
    return NextResponse.json({ success: false, message: "Server configuration error" }, { status: 500 });
  }

  const token = cookies().get(HOME_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return NextResponse.json({ success: false, message: "Session expired" }, { status: 401 });
  }

  if (decoded?.audience !== "homeowner") {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const homeowner = await Homeowner.findById(decoded.id);
  if (!homeowner) {
    return NextResponse.json({ success: false, message: "Resident not found" }, { status: 401 });
  }

  return homeowner;
}

export async function PATCH(req) {
  await connectDB();

  const homeowner = await resolveHomeowner();
  if (homeowner instanceof NextResponse) {
    return homeowner;
  }

  let payload;
  try {
    payload = await req.json();
  } catch (error) {
    return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 });
  }

  const update = {};

  if (payload?.name) {
    update.name = payload.name.toString().trim().slice(0, 60);
  }

  if (payload?.phone !== undefined) {
    const phone = payload.phone.toString().trim();
    if (phone && !/^[0-9]{10}$/.test(phone)) {
      return NextResponse.json({ success: false, message: "Phone must be 10 digits" }, { status: 400 });
    }
    update.phone = phone;
  }

  if (Array.isArray(payload?.preferences)) {
    update.preferences = payload.preferences
      .map((item) => item.toString().trim())
      .filter((item) => item.length > 0)
      .slice(0, 8);
  }

  if (payload?.address && typeof payload.address === "object") {
    const source = payload.address;
    const address = {
      label: (source.label || "Home").toString().trim().slice(0, 40),
      street: (source.street || "").toString().trim().slice(0, 120),
      city: (source.city || "").toString().trim().slice(0, 60),
      state: (source.state || "").toString().trim().slice(0, 60),
      postalCode: (source.postalCode || "").toString().trim().slice(0, 12),
    };
    update.addressBook = [address];
  }

  if (payload?.avatar) {
    update.avatar = payload.avatar.toString();
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ success: false, message: "Nothing to update" }, { status: 400 });
  }

  Object.assign(homeowner, update);
  await homeowner.save();

  return NextResponse.json({ success: true, homeowner: sanitizeHomeowner(homeowner) });
}
