import { NextResponse } from "next/server";
import ServiceProvider from "@/models/ServiceProvider";
import connectDB from "@/lib/mongodb";

export async function POST(req) {
  try {
    // Connect to database with timeout
    await Promise.race([
      connectDB(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout')), 8000)
      )
    ]);

    const body = await req.json();
    console.log("Received registration data:", body);

    // Validate required fields
    if (!body.name || !body.email || !body.phone) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!body.services || body.services.length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one service is required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingProvider = await ServiceProvider.findOne({ email: body.email });
    if (existingProvider) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 400 }
      );
    }

    const newProvider = new ServiceProvider(body);
    await newProvider.save();

    console.log("✅ Provider registered successfully:", newProvider._id);

    return NextResponse.json(
      { success: true, message: "Provider registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error in POST /register:", error);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, message: Object.values(error.errors).map(e => e.message).join(', ') },
        { status: 400 }
      );
    }
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
