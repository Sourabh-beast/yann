import { NextResponse } from "next/server";
import ServiceProvider from "@/models/ServiceProvider";
import Service from "@/models/Service";
import connectDB from "@/lib/connectDB";

const DEFAULT_MAX_BY_CATEGORY = {
  cleaning: 5000,
  laundry: 2000,
  pujari: 25000,
  driver: 2000,
  other: 10000
};

const DEFAULT_MAX_BY_SERVICE = {
  'Full-Day Personal Driver': 1800,
  'Outstation Driving Service': 2200,

  'Lakshmi Puja': 7000,
  'Satyanarayan Katha': 6000,
  'Ganesh Puja at Home': 6000,
  'Griha Pravesh Puja': 9000,
  'Vastu Shanti Puja': 8000,
  'Havan Ceremony': 7000,
  'Rudrabhishek Puja': 9000,
  'Vivah (Wedding Ceremony)': 25000,
  'Ring Ceremony': 12000,
  'Ramayan Path': 8000,
  'Mahamrityunjay Jaap': 12000,
  'Gayatri Jaap': 8000,
  'Pitra Shanti Puja': 10000,
  'Nav Graha Shanti': 10000,
  'Bhoomi Poojan': 6000,
  'Vaahan Poojan': 4000,
  'Shraadh Karm': 12000,
  'Janmadin Poojan': 4000,
  'Sundarkand Path': 7000,

  'Deep House Cleaning': 6000,
  'Regular House Cleaning': 3500,
  'Bathroom Deep Clean': 1500,
  'Kitchen Deep Clean': 2000,
  'Carpet Cleaning': 2500,
  'Sofa & Upholstery Clean': 2500,
  'Window Cleaning': 1500,
  'Move-in/Move-out Cleaning': 6000,
  'Office Cleaning': 8000,
  'Post-Construction Cleaning': 9000,
  'Balcony Cleaning': 1500,
  'Chimney & Exhaust Cleaning': 2000,
  'Water Tank Cleaning': 3000,

  'Laundry & Ironing': 1000,
  'Dry Cleaning Service': 1500,

  'Other': 5000,
};

const CATEGORY_SERVICES = {
  cleaning: [
    'Deep House Cleaning',
    'Regular House Cleaning',
    'Bathroom Deep Clean',
    'Kitchen Deep Clean',
    'Carpet Cleaning',
    'Sofa & Upholstery Clean',
    'Window Cleaning',
    'Move-in/Move-out Cleaning',
    'Office Cleaning',
    'Post-Construction Cleaning',
    'Balcony Cleaning',
    'Chimney & Exhaust Cleaning',
    'Water Tank Cleaning'
  ],
  laundry: [
    'Laundry & Ironing',
    'Dry Cleaning Service'
  ],
  pujari: [
    'Ganesh Puja at Home',
    'Griha Pravesh Puja',
    'Satyanarayan Katha',
    'Havan Ceremony',
    'Lakshmi Puja',
    'Rudrabhishek Puja',
    'Vastu Shanti Puja',
    'Vivah (Wedding Ceremony)',
    'Ring Ceremony',
    'Ramayan Path',
    'Mahamrityunjay Jaap',
    'Gayatri Jaap',
    'Pitra Shanti Puja',
    'Nav Graha Shanti',
    'Bhoomi Poojan',
    'Vaahan Poojan',
    'Shraadh Karm',
    'Janmadin Poojan',
    'Sundarkand Path'
  ],
  driver: [
    'Full-Day Personal Driver',
    'Outstation Driving Service'
  ],
  other: [
    'Other'
  ]
};

const DEFAULT_MAX_PRICE_BY_SERVICE = Object.fromEntries(
  Object.entries(CATEGORY_SERVICES).flatMap(([category, services]) =>
    services.map(service => [
      service,
      DEFAULT_MAX_BY_SERVICE[service] || DEFAULT_MAX_BY_CATEGORY[category] || 0
    ])
  )
);

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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

    // Check for Driver service exclusivity
    const hasDriverService = body.services.some(s => CATEGORY_SERVICES.driver?.includes(s));
    const hasOtherService = body.services.some(s => !CATEGORY_SERVICES.driver?.includes(s));

    if (hasDriverService && hasOtherService) {
      return NextResponse.json(
        { success: false, message: "Driver services cannot be combined with other service types." },
        { status: 400 }
      );
    }

    if (hasDriverService) {
      const driverDetails = body.driverServiceDetails || {};
      if (!driverDetails.licenseFrontImage || !driverDetails.licenseBackImage) {
        return NextResponse.json(
          { success: false, message: "Both front and back photos of the driving license are required." },
          { status: 400 }
        );
      }
    }

    if (!Array.isArray(body.serviceRates) || body.serviceRates.length === 0) {
      return NextResponse.json(
        { success: false, message: "Please provide pricing for each selected service" },
        { status: 400 }
      );
    }

    // Ensure every selected service has a price entry
    const normalizedRates = body.services.map(serviceName => {
      const rate = body.serviceRates.find(rateEntry => rateEntry.serviceName === serviceName);
      if (!rate || rate.price === undefined || rate.price === null) {
        const err = new Error(`Missing price for service: ${serviceName}`);
        err.statusCode = 400;
        throw err;
      }
      const numericPrice = Number(rate.price);
      if (Number.isNaN(numericPrice) || numericPrice < 0) {
        const err = new Error(`Invalid price for service: ${serviceName}`);
        err.statusCode = 400;
        throw err;
      }
      return {
        serviceName,
        price: numericPrice
      };
    });

    body.serviceRates = normalizedRates;

    // Ensure every selected service has an experience entry
    const normalizedExperiences = body.services.map(serviceName => {
      const expEntry = (body.serviceExperiences || []).find(entry => entry.serviceName === serviceName);
      if (!expEntry || expEntry.years === undefined || expEntry.years === null) {
        const err = new Error(`Missing experience for service: ${serviceName}`);
        err.statusCode = 400;
        throw err;
      }
      const numericYears = Number(expEntry.years);
      if (Number.isNaN(numericYears) || numericYears < 0 || numericYears > 50) {
        const err = new Error(`Invalid experience for service: ${serviceName}`);
        err.statusCode = 400;
        throw err;
      }
      return {
        serviceName,
        years: numericYears
      };
    });

    body.serviceExperiences = normalizedExperiences;

    // Enforce max price limits per service
    const serviceRegexes = body.services.map(serviceName => ({
      title: { $regex: `^${escapeRegex(serviceName)}$`, $options: 'i' }
    }));
    const serviceDocs = serviceRegexes.length
      ? await Service.find({ $or: serviceRegexes }).select('title maxPrice experiencePriceLimits category').lean()
      : [];
    const maxPriceByTitle = new Map(
      serviceDocs.map(doc => [doc.title.toLowerCase(), Number(doc.maxPrice || 0)])
    );
    const experienceLimitsByTitle = new Map(
      serviceDocs.map(doc => [doc.title.toLowerCase(), doc.experiencePriceLimits || []])
    );
    const categoryByTitle = new Map(
      serviceDocs.map(doc => [doc.title.toLowerCase(), doc.category])
    );

    const getLimitForExperience = (limits = [], years = 0) => {
      if (!Array.isArray(limits) || limits.length === 0) return 0;
      const match = limits.find(limit => {
        const min = Number(limit.minYears || 0);
        const max = limit.maxYears === null || limit.maxYears === undefined ? null : Number(limit.maxYears);
        return years >= min && (max === null || years < max);
      });
      return match ? Number(match.maxPrice || 0) : 0;
    };

    body.serviceRates.forEach(rate => {
      const titleKey = String(rate.serviceName || '').toLowerCase();
      const configuredMax = maxPriceByTitle.get(titleKey) || 0;
      const experienceLimits = experienceLimitsByTitle.get(titleKey) || [];
      const serviceCategory = categoryByTitle.get(titleKey);
      const fallbackMax = DEFAULT_MAX_PRICE_BY_SERVICE[rate.serviceName] || DEFAULT_MAX_BY_CATEGORY[serviceCategory] || 0;
      const experienceYears = Number(
        (body.serviceExperiences || []).find(entry => entry.serviceName === rate.serviceName)?.years || 0
      );
      const experienceMax = getLimitForExperience(experienceLimits, experienceYears);
      const effectiveMax = experienceMax > 0 ? experienceMax : (configuredMax > 0 ? configuredMax : fallbackMax);

      if (effectiveMax > 0 && rate.price > effectiveMax) {
        const err = new Error(`Price for ${rate.serviceName} cannot exceed ₹${effectiveMax}`);
        err.statusCode = 400;
        throw err;
      }
    });

    // Check if email already exists
    const existingProvider = await ServiceProvider.findOne({ email: body.email });
    if (existingProvider) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 400 }
      );
    }

    // Explicitly destructure driver details if present
    const providerData = {
      ...body,
      driverServiceDetails: body.driverServiceDetails || {
        vehicleTypes: [],
        transmissionTypes: [],
        tripPreference: 'both'
      }
    };

    const newProvider = new ServiceProvider(providerData);
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

    if (error.statusCode) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
