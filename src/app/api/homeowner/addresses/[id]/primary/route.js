import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Homeowner from "@/models/Homeowner";

const HOME_COOKIE = "yann_home_session";

const getAuthToken = async (request) => {
  const cookieStore = await cookies();
  let token = cookieStore.get(HOME_COOKIE)?.value;
  
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
    return { success: false, message: "Invalid or expired session", status: 401 };
  }
};

// PUT /api/homeowner/addresses/[id]/primary - Set address as primary
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const token = await getAuthToken(request);
    const authResult = await verifyHomeowner(token);

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: authResult.status }
      );
    }

    const { homeowner } = authResult;
    const { id } = params;

    const addressIndex = homeowner.addressBook.findIndex(
      (addr) => addr._id.toString() === id
    );

    if (addressIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Address not found" },
        { status: 404 }
      );
    }

    // Move the address to the first position (making it primary)
    if (addressIndex !== 0) {
      const [address] = homeowner.addressBook.splice(addressIndex, 1);
      homeowner.addressBook.unshift(address);
      await homeowner.save();
    }

    return NextResponse.json({
      success: true,
      message: "Primary address updated successfully",
      addresses: homeowner.addressBook.map((addr, index) => ({
        id: addr._id.toString(),
        label: addr.label,
        street: addr.street,
        city: addr.city,
        state: addr.state,
        postalCode: addr.postalCode,
        isPrimary: index === 0,
      })),
    });
  } catch (error) {
    console.error("Error setting primary address:", error);
    return NextResponse.json(
      { success: false, message: "Unable to set primary address" },
      { status: 500 }
    );
  }
}
