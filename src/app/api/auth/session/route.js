import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import ServiceProvider from "@/models/ServiceProvider";
import Homeowner from "@/models/Homeowner";

const PROVIDER_COOKIE = "yann_session";
const HOME_COOKIE = "yann_home_session";

/**
 * GET /api/auth/session
 * Unified session endpoint — checks both provider and homeowner sessions
 * in a single request instead of making 2 separate API calls.
 * Reduces origin transfer by ~50% for session checks.
 */
export async function GET(request) {
  try {
    await connectDB();
    const cookieStore = await cookies();

    // --- Try provider session first ---
    const providerToken = cookieStore.get(PROVIDER_COOKIE)?.value;
    if (providerToken && process.env.JWT_SECRET) {
      try {
        const decoded = jwt.verify(providerToken, process.env.JWT_SECRET);
        if (!decoded?.audience || decoded.audience === "provider") {
          const provider = await ServiceProvider.findOne({ email: decoded.email });
          if (provider) {
            return NextResponse.json({
              success: true,
              role: "provider",
              provider: {
                _id: provider._id.toString(),
                id: provider._id.toString(),
                name: provider.name,
                email: provider.email,
                services: provider.services,
                serviceRates: provider.serviceRates || [],
                selectedCategories: provider.selectedCategories || [],
                status: provider.status,
                rating: provider.rating,
                totalReviews: provider.totalReviews,
                experience: provider.experience,
                phone: provider.phone,
                workingHours: provider.workingHours || null,
                profileImage: provider.profileImage || '',
                pendingServiceRequest: provider.pendingServiceRequest || null,
                isOnline: provider.isOnline ?? true,
              },
            });
          }
        }
      } catch (err) {
        // Provider token invalid, continue to check homeowner
      }
    }

    // --- Try homeowner session ---
    let homeToken = cookieStore.get(HOME_COOKIE)?.value;
    // Also try Authorization header (for mobile)
    if (!homeToken) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        homeToken = authHeader.substring(7);
      }
    }

    if (homeToken && process.env.JWT_SECRET) {
      try {
        const decoded = jwt.verify(homeToken, process.env.JWT_SECRET);
        if (decoded?.audience === "homeowner") {
          const homeowner = await Homeowner.findOne({ email: decoded.email });
          if (homeowner) {
            return NextResponse.json({
              success: true,
              role: "resident",
              homeowner: {
                id: homeowner._id.toString(),
                name: homeowner.name,
                email: homeowner.email,
                phone: homeowner.phone || "",
                avatar: homeowner.avatar || homeowner.profileImage || "",
                profileImage: homeowner.profileImage || homeowner.avatar || "",
                preferences: homeowner.preferences || [],
                savedProviders: homeowner.savedProviders || [],
                addressBook: homeowner.addressBook || [],
                isVerified: homeowner.isVerified || false,
                aadhaarVerified: homeowner.aadhaarVerified || false,
                aadhaarVerifiedAt: homeowner.aadhaarVerifiedAt || null,
              },
            });
          }
        }
      } catch (err) {
        // Homeowner token invalid
      }
    }

    // No valid session found
    return NextResponse.json(
      { success: false, role: null, message: "No active session" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Error fetching unified session:", error);
    return NextResponse.json(
      { success: false, message: "Unable to fetch session" },
      { status: 500 }
    );
  }
}
