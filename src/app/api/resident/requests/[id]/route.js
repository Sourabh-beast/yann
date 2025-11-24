import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/connectDB";
import ResidentRequest from "@/models/ResidentRequest";
import Homeowner from "@/models/Homeowner";
import Booking from "@/models/Booking";

const HOME_COOKIE = "yann_home_session";

const sanitizeNegotiation = (negotiation) => {
  if (!negotiation) {
    return { isActive: false, status: "idle" };
  }
  return {
    isActive: negotiation.isActive,
    proposedAmount: negotiation.proposedAmount,
    providerId: negotiation.providerId ? negotiation.providerId.toString() : null,
    providerName: negotiation.providerName,
    note: negotiation.note,
    status: negotiation.status,
    updatedAt: negotiation.updatedAt ? negotiation.updatedAt.toISOString() : null,
  };
};

const sanitizeRequest = (request) => ({
  id: request._id.toString(),
  title: request.title,
  serviceType: request.serviceType,
  description: request.description || "",
  status: request.status,
  scheduledFor: request.scheduledFor ? request.scheduledFor.toISOString() : null,
  priority: request.priority,
  locationLabel: request.locationLabel,
  createdAt: request.createdAt.toISOString(),
  updatedAt: request.updatedAt.toISOString(),
  bookingId: request.booking ? request.booking.toString() : null,
  negotiation: sanitizeNegotiation(request.negotiation),
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

export async function PATCH(req, { params }) {
  await connectDB();

  const homeowner = await resolveHomeowner();
  if (homeowner instanceof NextResponse) {
    return homeowner;
  }

  const requestId = params?.id;
  if (!requestId) {
    return NextResponse.json({ success: false, message: "Request id missing" }, { status: 400 });
  }

  let payload;
  try {
    payload = await req.json();
  } catch (error) {
    return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 });
  }

  const update = {};
  if (payload?.status) {
    const allowedStatuses = ["draft", "pending", "scheduled", "ongoing", "completed", "cancelled", "accepted", "denied"];
    if (!allowedStatuses.includes(payload.status)) {
      return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 });
    }
    update.status = payload.status;
  }

  if (payload?.scheduledFor) {
    const parsed = new Date(payload.scheduledFor);
    if (Number.isNaN(parsed.getTime())) {
      return NextResponse.json({ success: false, message: "Invalid schedule date" }, { status: 400 });
    }
    update.scheduledFor = parsed;
  }

  if (payload?.priority) {
    update.priority = payload.priority === "urgent" ? "urgent" : "routine";
  }

  if (payload?.locationLabel) {
    update.locationLabel = payload.locationLabel.trim().slice(0, 60);
  }

  if (payload?.description !== undefined) {
    update.description = payload.description.trim().slice(0, 400);
  }

  if (Object.keys(update).length === 0 && !payload?.negotiationAction) {
    return NextResponse.json({ success: false, message: "Nothing to update" }, { status: 400 });
  }

  const requestDoc = await ResidentRequest.findOne({ _id: requestId, homeowner: homeowner._id });

  if (!requestDoc) {
    return NextResponse.json({ success: false, message: "Request not found" }, { status: 404 });
  }

  if (payload?.negotiationAction) {
    if (!requestDoc.booking) {
      return NextResponse.json({ success: false, message: "No linked booking for negotiation" }, { status: 400 });
    }

    const booking = await Booking.findById(requestDoc.booking);
    if (!booking || !booking.negotiation || !booking.negotiation.isActive) {
      return NextResponse.json({ success: false, message: "No active negotiation" }, { status: 400 });
    }

    if (payload.negotiationAction === "accept") {
      booking.status = "accepted";
      booking.assignedProvider = booking.negotiation.providerId;
      booking.providerName = booking.negotiation.providerName;
      if (booking.negotiation.proposedAmount) {
        booking.totalPrice = booking.negotiation.proposedAmount;
      }
      booking.negotiation.isActive = false;
      booking.negotiation.status = "accepted";
      booking.negotiation.respondedAt = new Date();
      requestDoc.status = "accepted";
    } else if (payload.negotiationAction === "decline") {
      booking.negotiation.isActive = false;
      booking.negotiation.status = "declined";
      booking.negotiation.respondedAt = new Date();
      requestDoc.status = "pending";
    } else {
      return NextResponse.json({ success: false, message: "Unsupported negotiation action" }, { status: 400 });
    }

    requestDoc.negotiation = {
      isActive: booking.negotiation.isActive,
      proposedAmount: booking.negotiation.proposedAmount,
      providerId: booking.negotiation.providerId,
      providerName: booking.negotiation.providerName,
      note: booking.negotiation.note,
      status: booking.negotiation.status,
      updatedAt: new Date(),
    };

    await booking.save();
    await requestDoc.save();

    return NextResponse.json({ success: true, request: sanitizeRequest(requestDoc) });
  }

  Object.assign(requestDoc, update);
  await requestDoc.save();

  return NextResponse.json({ success: true, request: sanitizeRequest(requestDoc) });
}

export async function DELETE(_, { params }) {
  await connectDB();

  const homeowner = await resolveHomeowner();
  if (homeowner instanceof NextResponse) {
    return homeowner;
  }

  const requestId = params?.id;
  if (!requestId) {
    return NextResponse.json({ success: false, message: "Request id missing" }, { status: 400 });
  }

  const deleted = await ResidentRequest.findOneAndDelete({ _id: requestId, homeowner: homeowner._id });
  if (!deleted) {
    return NextResponse.json({ success: false, message: "Request not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
