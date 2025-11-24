import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/connectDB";
import ResidentRequest from "@/models/ResidentRequest";
import Homeowner from "@/models/Homeowner";

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

export async function GET() {
  await connectDB();

  const homeowner = await resolveHomeowner();
  if (homeowner instanceof NextResponse) {
    return homeowner;
  }

  const requests = await ResidentRequest.find({ homeowner: homeowner._id }).sort({ createdAt: -1 });

  return NextResponse.json({
    success: true,
    requests: requests.map((request) => sanitizeRequest(request)),
  });
}

export async function POST(req) {
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

  const title = payload?.title?.trim();
  const serviceType = payload?.serviceType?.trim();
  const description = payload?.description?.trim() || "";
  const priority = payload?.priority === "urgent" ? "urgent" : "routine";
  const locationLabel = payload?.locationLabel?.trim() || "Home";

  if (!title || !serviceType) {
    return NextResponse.json({ success: false, message: "Title and service type are required" }, { status: 400 });
  }

  let scheduledFor = null;
  if (payload?.scheduledFor) {
    const parsed = new Date(payload.scheduledFor);
    if (Number.isNaN(parsed.getTime())) {
      return NextResponse.json({ success: false, message: "Invalid schedule date" }, { status: 400 });
    }
    scheduledFor = parsed;
  }

  const requestDoc = await ResidentRequest.create({
    homeowner: homeowner._id,
    title,
    serviceType,
    description,
    scheduledFor,
    priority,
    locationLabel,
  });

  return NextResponse.json(
    {
      success: true,
      request: sanitizeRequest(requestDoc),
    },
    { status: 201 }
  );
}
