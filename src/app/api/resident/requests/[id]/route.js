import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/connectDB";
import ResidentRequest from "@/models/ResidentRequest";
import Homeowner from "@/models/Homeowner";

const HOME_COOKIE = "yann_home_session";

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
    const allowedStatuses = ["draft", "pending", "scheduled", "ongoing", "completed", "cancelled"];
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

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ success: false, message: "Nothing to update" }, { status: 400 });
  }

  const requestDoc = await ResidentRequest.findOneAndUpdate(
    { _id: requestId, homeowner: homeowner._id },
    { $set: update },
    { new: true }
  );

  if (!requestDoc) {
    return NextResponse.json({ success: false, message: "Request not found" }, { status: 404 });
  }

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
