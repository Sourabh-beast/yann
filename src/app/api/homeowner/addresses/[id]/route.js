import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Homeowner from "@/models/Homeowner";

const HOME_COOKIE = "yann_home_session";

const getAuthToken = (request) => {
  let token = cookies().get(HOME_COOKIE)?.value;
  
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

// PUT /api/homeowner/addresses/[id] - Update address
export async function PUT(request, { params }) {
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
    const { id } = params;
    const body = await request.json();

    const addressIndex = homeowner.addressBook.findIndex(
      (addr) => addr._id.toString() === id
    );

    if (addressIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Address not found" },
        { status: 404 }
      );
    }

    // Update address fields
    if (body.label) homeowner.addressBook[addressIndex].label = body.label.trim();
    if (body.street) homeowner.addressBook[addressIndex].street = body.street.trim();
    if (body.city) homeowner.addressBook[addressIndex].city = body.city.trim();
    if (body.state !== undefined) homeowner.addressBook[addressIndex].state = body.state.trim();
    if (body.postalCode !== undefined) homeowner.addressBook[addressIndex].postalCode = body.postalCode.trim();

    await homeowner.save();

    const updatedAddress = homeowner.addressBook[addressIndex];

    return NextResponse.json({
      success: true,
      message: "Address updated successfully",
      address: {
        id: updatedAddress._id.toString(),
        label: updatedAddress.label,
        street: updatedAddress.street,
        city: updatedAddress.city,
        state: updatedAddress.state,
        postalCode: updatedAddress.postalCode,
        isPrimary: addressIndex === 0,
      },
    });
  } catch (error) {
    console.error("Error updating address:", error);
    return NextResponse.json(
      { success: false, message: "Unable to update address" },
      { status: 500 }
    );
  }
}

// DELETE /api/homeowner/addresses/[id] - Delete address
export async function DELETE(request, { params }) {
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

    // Remove address
    homeowner.addressBook.splice(addressIndex, 1);
    await homeowner.save();

    return NextResponse.json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    return NextResponse.json(
      { success: false, message: "Unable to delete address" },
      { status: 500 }
    );
  }
}
