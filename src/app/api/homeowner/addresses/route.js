import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Homeowner from "@/models/Homeowner";

const HOME_COOKIE = "yann_home_session";

const getAuthToken = (request) => {
  // Support both cookie-based (website) and token-based (mobile app) authentication
  let token = cookies().get(HOME_COOKIE)?.value;
  
  // If no cookie, check Authorization header for mobile app
  if (!token) {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }
  
  return token;
};

const verifyHomeowner = async (token) => {
  if (!token) {
    return { success: false, message: "Session not found", status: 401 };
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT secret is not configured");
    return { success: false, message: "Server configuration error", status: 500 };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded?.audience !== "homeowner") {
      return { success: false, message: "Invalid session scope", status: 401 };
    }

    const homeowner = await Homeowner.findOne({ email: decoded.email });
    if (!homeowner) {
      return { success: false, message: "Homeowner not found", status: 404 };
    }

    return { success: true, homeowner };
  } catch (error) {
    console.error("Error verifying token:", error);
    return { success: false, message: "Invalid or expired session", status: 401 };
  }
};

// GET /api/homeowner/addresses - Get all saved addresses
export async function GET(request) {
  try {
    await connectDB();

    const token = getAuthToken(request);
    const authResult = await verifyHomeowner(token);

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: authResult.status }
      );
    }

    const { homeowner } = authResult;
    const addresses = homeowner.addressBook || [];

    return NextResponse.json({
      success: true,
      addresses: addresses.map((addr, index) => ({
        id: addr._id?.toString() || `addr-${index}`,
        label: addr.label || "Home",
        street: addr.street || "",
        city: addr.city || "",
        state: addr.state || "",
        postalCode: addr.postalCode || "",
        isPrimary: index === 0, // First address is primary
      })),
    });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json(
      { success: false, message: "Unable to fetch addresses" },
      { status: 500 }
    );
  }
}

// POST /api/homeowner/addresses - Add new address
export async function POST(request) {
  try {
    await connectDB();

    const token = getAuthToken(request);
    const authResult = await verifyHomeowner(token);

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: authResult.status }
      );
    }

    const { homeowner } = authResult;
    const body = await request.json();

    // Validate required fields
    if (!body.label || !body.street || !body.city) {
      return NextResponse.json(
        { success: false, message: "Label, street, and city are required" },
        { status: 400 }
      );
    }

    const newAddress = {
      label: body.label.trim(),
      street: body.street.trim(),
      city: body.city.trim(),
      state: body.state?.trim() || "",
      postalCode: body.postalCode?.trim() || "",
    };

    // Add to addressBook
    homeowner.addressBook.push(newAddress);
    await homeowner.save();

    const savedAddress = homeowner.addressBook[homeowner.addressBook.length - 1];

    return NextResponse.json({
      success: true,
      message: "Address added successfully",
      address: {
        id: savedAddress._id.toString(),
        label: savedAddress.label,
        street: savedAddress.street,
        city: savedAddress.city,
        state: savedAddress.state,
        postalCode: savedAddress.postalCode,
        isPrimary: homeowner.addressBook.length === 1,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error adding address:", error);
    return NextResponse.json(
      { success: false, message: "Unable to add address" },
      { status: 500 }
    );
  }
}
