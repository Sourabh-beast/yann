import { NextResponse } from "next/server";
import ServiceProvider from "@/models/ServiceProvider";
import connectDB from "@/lib/mongodb";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    console.log("Received data:", body); // 👈 Add this

    const newProvider = new ServiceProvider(body);
    await newProvider.save();

    return NextResponse.json(
      { success: true, message: "Provider registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /register:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 } // Changed to 400 for validation errors
    );
  }
}
