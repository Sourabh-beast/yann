import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import ServiceProvider from '@/models/ServiceProvider';

export async function POST(request) {
  try {
    await connectDB();

    const { providerId, services, serviceRates, driverServiceDetails } = await request.json();

    // Validate input
    if (!providerId) {
      return NextResponse.json(
        { success: false, message: 'Provider ID is required' },
        { status: 400 }
      );
    }

    if (!services || !Array.isArray(services) || services.length === 0) {
      return NextResponse.json(
        { success: false, message: 'At least one service is required' },
        { status: 400 }
      );
    }

    if (!serviceRates || !Array.isArray(serviceRates) || serviceRates.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Service rates are required' },
        { status: 400 }
      );
    }

    // Validate all rates have prices
    const invalidRate = serviceRates.find(rate => {
      return !rate.serviceName || typeof rate.price !== 'number' || rate.price <= 0;
    });

    if (invalidRate) {
      return NextResponse.json(
        { success: false, message: 'All services must have valid prices' },
        { status: 400 }
      );
    }

    // Find the provider
    const provider = await ServiceProvider.findById(providerId);

    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      );
    }

    // Check for duplicate services
    const existingServices = provider.services || [];
    const duplicateService = services.find(s => existingServices.includes(s));

    if (duplicateService) {
      return NextResponse.json(
        { success: false, message: `Service "${duplicateService}" is already added` },
        { status: 400 }
      );
    }

    // Store previous status for potential rollback info
    const previousStatus = provider.status;

    // Add new services and rates
    const updatedServices = [...existingServices, ...services];
    const existingRates = provider.serviceRates || [];
    const updatedRates = [...existingRates, ...serviceRates];

    // Determine new categories based on added services
    const categorizedServices = {
      'Cleaning Services': [
        'Deep House Cleaning', 'Regular House Cleaning', 'Bathroom Deep Clean',
        'Kitchen Deep Clean', 'Carpet Cleaning', 'Sofa & Upholstery Clean',
        'Window Cleaning', 'Move-in/Move-out Cleaning', 'Office Cleaning',
        'Post-Construction Cleaning', 'Balcony Cleaning', 'Chimney & Exhaust Cleaning',
        'Water Tank Cleaning',
      ],
      'Laundry Services': ['Laundry & Ironing', 'Dry Cleaning Service'],
      'Pujari Services': [
        'Ganesh Puja at Home', 'Griha Pravesh Puja', 'Satyanarayan Katha',
        'Havan Ceremony', 'Lakshmi Puja', 'Rudrabhishek Puja', 'Vastu Shanti Puja',
        'Vivah (Wedding Ceremony)', 'Ring Ceremony', 'Ramayan Path',
        'Mahamrityunjay Jaap', 'Gayatri Jaap', 'Pitra Shanti Puja',
        'Nav Graha Shanti', 'Bhoomi Poojan', 'Vaahan Poojan', 'Shraadh Karm',
        'Janmadin Poojan', 'Sundarkand Path',
      ],
      'Driver Services': ['Full-Day Personal Driver', 'Outstation Driving Service', 'Personal Driver'],
      'Electrical Services': [
        'Light Fitting',
        'Fan Fitting',
        'Fan Repair',
        'Switch and Socket Repair',
        'Short Circuit Troubleshooting',
        'MCB and Fuse Repair',
        'Wiring and Rewiring',
        'Water Pump Repair',
        'Starter Repair',
        'Cooler Repair',
      ],
      'Home Appliance Repair': [
        'AC Service and Repair',
        'Window AC Installation',
        'Split AC Installation',
        'Window AC Service',
        'Split AC Service',
        'Window AC Water Leakage',
        'Split AC Water Leakage',
        'AC Noise and Start Issue',
        'Refrigerator Repair',
        'Washing Machine Repair',
        'Microwave Repair',
        'LCD/LED TV Repair',
        'Music System Repair',
        'Induction Cooktop Repair',
        'Iron Repair',
        'Juicer Mixer Grinder Repair',
      ],
      'Other Services': ['Other']
    };

    // Find categories for new services
    const newCategories = new Set(provider.selectedCategories || []);
    services.forEach(serviceName => {
      for (const [category, categoryServices] of Object.entries(categorizedServices)) {
        if (categoryServices.includes(serviceName)) {
          newCategories.add(category);
          break;
        }
      }
    });

    // Prepare update data
    const updateData = {
      services: updatedServices,
      serviceRates: updatedRates,
      selectedCategories: Array.from(newCategories),
      status: 'pending', // Change status to pending for admin review
    };

    // Add driver details if present
    if (driverServiceDetails) {
      updateData.driverServiceDetails = driverServiceDetails;
    }

    // Update provider with new services and set status to pending
    const updatedProvider = await ServiceProvider.findByIdAndUpdate(
      providerId,
      {
        ...updateData,
        // Store pending service info for admin to see what was added
        $set: {
          pendingServiceRequest: {
            addedServices: services,
            addedRates: serviceRates,
            driverServiceDetails: driverServiceDetails,
            previousStatus: previousStatus,
            requestedAt: new Date()
          }
        }
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Service request submitted for admin approval. Your account is now pending review.',
      data: {
        provider: updatedProvider,
        addedServices: services,
        previousStatus
      }
    });

  } catch (error) {
    console.error('Error adding service:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to add service' },
      { status: 500 }
    );
  }
}
