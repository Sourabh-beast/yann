import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Service from '@/models/Service';

// Static fallback services if database is empty
const STATIC_SERVICES = [
  {
    id: 'static-1',
    title: 'House Cleaning',
    description: 'Professional cleaning services for your home',
    category: 'cleaning',
    price: 'Starting at ₹299',
    features: ['Deep Cleaning', 'Regular Maintenance', 'Move-in/Move-out'],
    icon: '🏠',
    popular: true,
  },
  {
    id: 'static-2',
    title: 'Repairs & Maintenance',
    description: 'Expert repair services for all household needs',
    category: 'maintenance',
    price: 'Starting at ₹399',
    features: ['Plumbing', 'Electrical', 'Carpentry', 'Painting'],
    icon: '🔧',
    popular: true,
  },
  {
    id: 'static-3',
    title: 'Full-Day Personal Driver',
    description: 'Professional driver services for your daily needs',
    category: 'driver',
    price: 'Starting at ₹1,500',
    features: ['12-Hour Service', 'City Tours', 'Airport Transfer'],
    icon: '🚗',
    popular: true,
  },
  {
    id: 'static-4',
    title: 'Pujari Services',
    description: 'Experienced priests for all religious ceremonies',
    category: 'pujari',
    price: 'Starting at ₹501',
    features: ['Puja', 'Havan', 'Satyanarayan Katha'],
    icon: '🙏',
    popular: false,
  },
  {
    id: 'static-5',
    title: 'Pet Care',
    description: 'Professional pet care services',
    category: 'pet-care',
    price: 'Starting at ₹129',
    features: ['Dog Walking', 'Pet Sitting', 'Grooming'],
    icon: '🐾',
    popular: false,
  },
  {
    id: 'static-6',
    title: 'Personal Assistant',
    description: 'Dedicated personal assistance for daily tasks',
    category: 'assistant',
    price: 'Starting at ₹399',
    features: ['Errands', 'Shopping', 'Scheduling'],
    icon: '👤',
    popular: false,
  },
  {
    id: 'static-7',
    title: 'Garden & Landscaping',
    description: 'Professional garden maintenance and design',
    category: 'garden',
    price: 'Starting at ₹299',
    features: ['Lawn Care', 'Planting', 'Landscaping'],
    icon: '🌿',
    popular: false,
  },
  {
    id: 'static-8',
    title: 'Delivery Services',
    description: 'Fast and reliable delivery services',
    category: 'delivery',
    price: 'Starting at ₹99',
    features: ['Same Day', 'Package Pickup', 'Document Delivery'],
    icon: '🚚',
    popular: false,
  },
];

/**
 * GET /api/services
 * Fetch all services or filter by category
 * Query params: category (optional)
 */
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // Build query
    const query = { isActive: { $ne: false } }; // Only active services
    if (category) {
      query.category = category;
    }

    // Get services from database
    let services = await Service.find(query)
      .sort({ popular: -1, order: 1, createdAt: -1 })
      .select('-__v');

    // If no services in database, return static services
    if (services.length === 0) {
      console.log('No services in database, returning static services');
      let staticData = STATIC_SERVICES;
      if (category) {
        staticData = staticData.filter(s => s.category === category);
      }
      return NextResponse.json({
        success: true,
        data: staticData,
      });
    }

    const mappedServices = services.map(service => ({
      id: service._id.toString(),
      title: service.title,
      description: service.description,
      category: service.category,
      price: service.price,
      features: service.features || [],
      icon: service.icon || '🏠',
      popular: service.popular || false,
    }));

    return NextResponse.json({
      success: true,
      data: mappedServices,
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    // Return static services on error
    return NextResponse.json({
      success: true,
      data: STATIC_SERVICES,
    });
  }
}

/**
 * POST /api/services
 * Create a new service (admin only)
 */
export async function POST(request) {
  try {
    await connectDB();

    let payload;
    try {
      payload = await request.json();
    } catch (err) {
      return NextResponse.json(
        { success: false, message: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { title, description, category, price, features, icon, popular } = payload;

    if (!title || !description || !category || !price) {
      return NextResponse.json(
        { success: false, message: 'Title, description, category, and price are required' },
        { status: 400 }
      );
    }

    const service = await Service.create({
      title,
      description,
      category,
      price,
      features: features || [],
      icon: icon || '🏠',
      popular: popular || false,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Service created successfully',
        data: {
          id: service._id.toString(),
          title: service.title,
          description: service.description,
          category: service.category,
          price: service.price,
          features: service.features,
          icon: service.icon,
          popular: service.popular,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create service' },
      { status: 500 }
    );
  }
}
