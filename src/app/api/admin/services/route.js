import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Service from '@/models/Service';

const EXPERIENCE_RANGES = [
  { minYears: 0, maxYears: 5 },
  { minYears: 5, maxYears: 10 },
  { minYears: 10, maxYears: 15 },
  { minYears: 15, maxYears: 20 },
  { minYears: 20, maxYears: 25 },
  { minYears: 25, maxYears: 30 },
  { minYears: 30, maxYears: null },
];

const CORE_DEFAULT_SERVICES = [
  {
    title: 'Light Fitting',
    description: 'Installation and replacement of indoor or outdoor light fixtures',
    category: 'electrical',
    icon: '💡',
    popular: true,
    maxPrice: 1200,
    features: ['Ceiling lights', 'Wall lights', 'Safe wiring checks'],
  },
  {
    title: 'Fan Fitting',
    description: 'Ceiling and wall fan installation by trained electricians',
    category: 'electrical',
    icon: '🌀',
    popular: true,
    maxPrice: 1500,
    features: ['New fitting', 'Alignment checks', 'Safety testing'],
  },
  {
    title: 'Fan Repair',
    description: 'Fan noise, speed, capacitor and motor issue repair',
    category: 'electrical',
    icon: '🛠️',
    maxPrice: 2000,
    features: ['Capacitor replacement', 'Motor checks', 'Wiring fixes'],
  },
  {
    title: 'Switch and Socket Repair',
    description: 'Switchboard, socket and minor wiring fault repair',
    category: 'electrical',
    icon: '🔌',
    maxPrice: 1800,
    features: ['Switch replacement', 'Socket repair', 'Loose connection fix'],
  },
  {
    title: 'Short Circuit Troubleshooting',
    description: 'Diagnosis and repair of short-circuit and trip issues',
    category: 'electrical',
    icon: '⚡',
    popular: true,
    maxPrice: 2500,
    features: ['Fault tracing', 'Load checks', 'Safe restoration'],
  },
  {
    title: 'MCB and Fuse Repair',
    description: 'MCB, fuse and distribution board related repair work',
    category: 'electrical',
    icon: '🧰',
    maxPrice: 2200,
    features: ['MCB replacement', 'Fuse fix', 'DB inspection'],
  },
  {
    title: 'Wiring and Rewiring',
    description: 'Partial or full rewiring for homes and offices',
    category: 'electrical',
    icon: '🧵',
    maxPrice: 5000,
    features: ['New wiring', 'Old wire replacement', 'Load planning'],
  },
  {
    title: 'Water Pump Repair',
    description: 'Residential water pump wiring and motor issue repair',
    category: 'electrical',
    icon: '🚰',
    maxPrice: 3500,
    features: ['Motor check', 'Starter check', 'Power line fix'],
  },
  {
    title: 'Starter Repair',
    description: 'Starter panel and starter circuit troubleshooting',
    category: 'electrical',
    icon: '🎛️',
    maxPrice: 2800,
    features: ['Panel diagnosis', 'Relay checks', 'Component replacement'],
  },
  {
    title: 'Cooler Repair',
    description: 'Air cooler motor, pump and electrical fault repair',
    category: 'electrical',
    icon: '❄️',
    maxPrice: 3000,
    features: ['Motor service', 'Pump repair', 'Cooling check'],
  },
  {
    title: 'AC Service and Repair',
    description: 'General AC service and diagnosis for cooling issues',
    category: 'appliance-repair',
    icon: '🌬️',
    popular: true,
    maxPrice: 5000,
    features: ['General service', 'Cooling check', 'Gas pressure check'],
  },
  {
    title: 'Window AC Installation',
    description: 'Professional window AC fitting and setup',
    category: 'appliance-repair',
    icon: '🪟',
    maxPrice: 4500,
    features: ['Mounting', 'Power check', 'Test run'],
  },
  {
    title: 'Split AC Installation',
    description: 'Indoor/outdoor unit installation with piping checks',
    category: 'appliance-repair',
    icon: '🏡',
    popular: true,
    maxPrice: 6000,
    features: ['Unit fitting', 'Pipe setup', 'Performance check'],
  },
  {
    title: 'Window AC Service',
    description: 'Routine cleaning and service of window AC units',
    category: 'appliance-repair',
    icon: '🧼',
    maxPrice: 3500,
    features: ['Filter cleaning', 'Coil clean', 'Airflow check'],
  },
  {
    title: 'Split AC Service',
    description: 'Routine cleaning and performance service for split AC',
    category: 'appliance-repair',
    icon: '🛋️',
    maxPrice: 3800,
    features: ['Indoor unit clean', 'Outdoor wash', 'Cooling tune-up'],
  },
  {
    title: 'Window AC Water Leakage',
    description: 'Drain and leakage issue repair for window AC units',
    category: 'appliance-repair',
    icon: '💧',
    maxPrice: 4200,
    features: ['Drain cleaning', 'Leak trace', 'Seal correction'],
  },
  {
    title: 'Split AC Water Leakage',
    description: 'Drain line and indoor leakage troubleshooting for split AC',
    category: 'appliance-repair',
    icon: '🌊',
    maxPrice: 4500,
    features: ['Drain unclog', 'Pipe correction', 'Leak prevention'],
  },
  {
    title: 'AC Noise and Start Issue',
    description: 'Compressor, capacitor and startup issue diagnosis',
    category: 'appliance-repair',
    icon: '🔊',
    maxPrice: 4500,
    features: ['Noise diagnosis', 'Startup fix', 'Component checks'],
  },
  {
    title: 'Refrigerator Repair',
    description: 'Cooling, gas, thermostat and electrical fridge repairs',
    category: 'appliance-repair',
    icon: '🧊',
    popular: true,
    maxPrice: 5000,
    features: ['Cooling fix', 'Thermostat checks', 'Gas top-up'],
  },
  {
    title: 'Washing Machine Repair',
    description: 'Drum, motor, inlet and drain related machine repairs',
    category: 'appliance-repair',
    icon: '🧺',
    popular: true,
    maxPrice: 5500,
    features: ['Spin issues', 'Drain fix', 'Motor checks'],
  },
  {
    title: 'Microwave Repair',
    description: 'Microwave heating and control board troubleshooting',
    category: 'appliance-repair',
    icon: '📡',
    maxPrice: 4500,
    features: ['Heating fix', 'Door switch check', 'Board repair'],
  },
  {
    title: 'LCD/LED TV Repair',
    description: 'Display, power and audio issues for TV units',
    category: 'appliance-repair',
    icon: '📺',
    maxPrice: 7000,
    features: ['Power issues', 'Display diagnostics', 'Sound fixes'],
  },
  {
    title: 'Music System Repair',
    description: 'Speaker and amplifier level diagnostics and repairs',
    category: 'appliance-repair',
    icon: '🎵',
    maxPrice: 5000,
    features: ['Audio checks', 'Amplifier repair', 'Power board fix'],
  },
  {
    title: 'Induction Cooktop Repair',
    description: 'Induction plate not heating or display issue fixes',
    category: 'appliance-repair',
    icon: '🍳',
    maxPrice: 3500,
    features: ['Heating diagnostics', 'Sensor checks', 'Board service'],
  },
  {
    title: 'Iron Repair',
    description: 'Electric iron heating and cord issue repair',
    category: 'appliance-repair',
    icon: '🧷',
    maxPrice: 1800,
    features: ['Heating element check', 'Cord repair', 'Switch service'],
  },
  {
    title: 'Juicer Mixer Grinder Repair',
    description: 'Mixer motor, jar lock and blade issue troubleshooting',
    category: 'appliance-repair',
    icon: '🥤',
    maxPrice: 3000,
    features: ['Motor repair', 'Blade replacement', 'Speed control fix'],
  },
];

const buildExperiencePriceLimits = (maxPrice = 0) => {
  return EXPERIENCE_RANGES.map(range => ({
    ...range,
    maxPrice,
  }));
};

const ensureCoreServiceCatalog = async () => {
  const existingServices = await Service.find({}, { title: 1 }).lean();
  const existingTitleSet = new Set(
    existingServices
      .map(item => String(item.title || '').trim().toLowerCase())
      .filter(Boolean)
  );

  const missingDocs = CORE_DEFAULT_SERVICES
    .filter(service => !existingTitleSet.has(service.title.toLowerCase()))
    .map((service, index) => {
      const tags = Array.from(new Set([service.category, 'admin-default', ...(service.features || [])
        .slice(0, 2)
        .map(feature => feature.toLowerCase().replace(/\s+/g, '-'))]));

      return {
        title: service.title,
        description: service.description,
        category: service.category,
        price: 'Varies',
        basePrice: 0,
        minPrice: 0,
        maxPrice: service.maxPrice || 0,
        experiencePriceLimits: buildExperiencePriceLimits(service.maxPrice || 0),
        features: service.features || [],
        icon: service.icon || '🔧',
        popular: !!service.popular,
        order: 600 + index,
        isActive: true,
        estimatedDuration: 60,
        tags,
      };
    });

  if (missingDocs.length > 0) {
    await Service.insertMany(missingDocs, { ordered: false });
  }

  return missingDocs.length;
};

// GET - Fetch all services with filters
export async function GET(request) {
  try {
    await connectDB();

    // Keep admin catalog in sync for newly introduced categories/services.
    try {
      await ensureCoreServiceCatalog();
    } catch (syncError) {
      console.error('Error syncing core service catalog:', syncError);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query.category = category;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    // Get total count
    const total = await Service.countDocuments(query);

    // Get services
    const services = await Service.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-__v');

    // Get unique categories
    const categories = await Service.distinct('category');

    return NextResponse.json({
      success: true,
      data: {
        services,
        categories,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

// POST - Create new service
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      title,
      description,
      category,
      price,
      basePrice,
      minPrice,
      maxPrice,
      experiencePriceLimits,
      features,
      icon,
      image,
      popular,
      order,
      isActive,
      estimatedDuration,
      tags
    } = body;

    // Validation
    if (!title || !description || !category) {
      return NextResponse.json(
        { success: false, message: 'Title, description and category are required' },
        { status: 400 }
      );
    }

    // Check if service with same title exists
    const existingService = await Service.findOne({ title: { $regex: `^${title}$`, $options: 'i' } });
    if (existingService) {
      return NextResponse.json(
        { success: false, message: 'Service with this title already exists' },
        { status: 400 }
      );
    }

    const normalizedExperienceLimits = Array.isArray(experiencePriceLimits)
      ? experiencePriceLimits.map(limit => ({
          minYears: Number(limit.minYears) || 0,
          maxYears: limit.maxYears === null || limit.maxYears === undefined || limit.maxYears === ''
            ? null
            : Number(limit.maxYears),
          maxPrice: Number(limit.maxPrice) || 0,
        }))
      : [];

    const service = await Service.create({
      title,
      description,
      category: category.toLowerCase(),
      price: price || 'Starting from ₹0',
      basePrice: basePrice || 0,
      minPrice: minPrice || 0,
      maxPrice: maxPrice || 0,
      experiencePriceLimits: normalizedExperienceLimits,
      features: features || [],
      icon: icon || '🏠',
      image: image || '',
      popular: popular || false,
      order: order || 0,
      isActive: isActive !== false,
      estimatedDuration: estimatedDuration || 60,
      tags: tags || []
    });

    return NextResponse.json({
      success: true,
      message: 'Service created successfully',
      data: service
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create service' },
      { status: 500 }
    );
  }
}

// PUT - Update service
export async function PUT(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Service ID is required' },
        { status: 400 }
      );
    }

    // If category is being updated, normalize it
    if (updateData.category) {
      updateData.category = updateData.category.toLowerCase();
    }

    if (Array.isArray(updateData.experiencePriceLimits)) {
      updateData.experiencePriceLimits = updateData.experiencePriceLimits.map(limit => ({
        minYears: Number(limit.minYears) || 0,
        maxYears: limit.maxYears === null || limit.maxYears === undefined || limit.maxYears === ''
          ? null
          : Number(limit.maxYears),
        maxPrice: Number(limit.maxPrice) || 0,
      }));
    }

    const service = await Service.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!service) {
      return NextResponse.json(
        { success: false, message: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Service updated successfully',
      data: service
    });
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update service' },
      { status: 500 }
    );
  }
}

// DELETE - Delete service
export async function DELETE(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Service ID is required' },
        { status: 400 }
      );
    }

    const service = await Service.findByIdAndDelete(id);

    if (!service) {
      return NextResponse.json(
        { success: false, message: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete service' },
      { status: 500 }
    );
  }
}

// PATCH - Toggle service status
export async function PATCH(request) {
  try {
    await connectDB();

    const { id, isActive } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Service ID is required' },
        { status: 400 }
      );
    }

    const service = await Service.findByIdAndUpdate(
      id,
      { isActive, updatedAt: new Date() },
      { new: true }
    );

    if (!service) {
      return NextResponse.json(
        { success: false, message: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Service ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: service
    });
  } catch (error) {
    console.error('Error toggling service status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update service status' },
      { status: 500 }
    );
  }
}
