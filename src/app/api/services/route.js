import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Service from '@/models/Service';

// Static fallback services if database is empty - All 17 Yann services
const STATIC_SERVICES = [
  {
    id: 1,
    title: 'Drivers',
    description: 'Professional drivers for your transportation needs',
    category: 'driver',
    price: 'Varies',
    icon: '🚗',
    popular: true,
    features: ['Licensed drivers', 'Flexible hours', 'Background verified'],
  },
  {
    id: 2,
    title: 'Pujari',
    description: 'Experienced pujaris for religious ceremonies',
    category: 'pujari',
    price: 'Varies',
    icon: '🙏',
    popular: true,
    features: ['Experienced pujaris', 'All rituals', 'Timely service'],
  },
  {
    id: 3,
    title: 'Maids',
    description: 'Reliable maids for household cleaning',
    category: 'cleaning',
    price: 'Varies',
    icon: '🧹',
    popular: true,
    features: ['Daily cleaning', 'Background verified', 'Flexible timing'],
  },
  {
    id: 4,
    title: 'Baby Sitters',
    description: 'Trusted baby sitters for childcare',
    category: 'childcare',
    price: 'Varies',
    icon: '👶',
    popular: true,
    features: ['Experienced caregivers', 'Background verified', 'Day/night shifts'],
  },
  {
    id: 5,
    title: 'Nurses',
    description: 'Qualified nurses for healthcare needs',
    category: 'healthcare',
    price: 'Varies',
    icon: '👩‍⚕️',
    popular: true,
    features: ['Certified nurses', '24/7 available', 'Emergency care'],
  },
  {
    id: 6,
    title: 'Attendants',
    description: 'Dedicated attendants for elderly and patient care',
    category: 'healthcare',
    price: 'Varies',
    icon: '🤝',
    features: ['Patient care', 'Elderly support', 'Day/night shifts'],
  },
  {
    id: 7,
    title: 'Cleaners',
    description: 'Professional cleaners for deep cleaning',
    category: 'cleaning',
    price: 'Varies',
    icon: '🧽',
    features: ['Deep cleaning', 'All surfaces', 'Eco-friendly products'],
  },
  {
    id: 8,
    title: 'Office Boys',
    description: 'Office support staff for various tasks',
    category: 'assistant',
    price: 'Varies',
    icon: '👔',
    features: ['Office tasks', 'Document handling', 'Reliable'],
  },
  {
    id: 9,
    title: 'Chaprasi',
    description: 'Chaprasi for office and residential support',
    category: 'assistant',
    price: 'Varies',
    icon: '🏢',
    features: ['Multi-task support', 'Document delivery', 'Office maintenance'],
  },
  {
    id: 10,
    title: 'Heena Artists',
    description: 'Skilled heena artists for events and occasions',
    category: 'specialty',
    price: 'Varies',
    icon: '🎨',
    features: ['Bridal heena', 'Modern designs', 'Natural heena'],
  },
  {
    id: 11,
    title: 'AC Service Technicians',
    description: 'Expert AC repair and maintenance',
    category: 'maintenance',
    price: 'Varies',
    icon: '❄️',
    features: ['All AC brands', 'Installation & repair', 'Maintenance'],
  },
  {
    id: 12,
    title: 'RO Service Technicians',
    description: 'RO water purifier service and repair',
    category: 'maintenance',
    price: 'Varies',
    icon: '💧',
    features: ['All RO brands', 'Installation & repair', 'Filter replacement'],
  },
  {
    id: 13,
    title: 'Refrigerator Service Technicians',
    description: 'Refrigerator repair and maintenance',
    category: 'maintenance',
    price: 'Varies',
    icon: '🧊',
    features: ['All brands', 'Gas refilling', 'Cooling issues'],
  },
  {
    id: 14,
    title: 'Air Purifier Service Technicians',
    description: 'Air purifier servicing and filter replacement',
    category: 'maintenance',
    price: 'Varies',
    icon: '🌬️',
    features: ['All brands', 'Filter replacement', 'Deep cleaning'],
  },
  {
    id: 15,
    title: 'Toilet Cleaning Experts',
    description: 'Specialized toilet and bathroom cleaning',
    category: 'cleaning',
    price: 'Varies',
    icon: '🚽',
    features: ['Deep cleaning', 'Sanitization', 'Odor removal'],
  },
  {
    id: 16,
    title: 'Chimney Service Technicians',
    description: 'Kitchen chimney cleaning and repair',
    category: 'maintenance',
    price: 'Varies',
    icon: '🔥',
    features: ['All brands', 'Deep cleaning', 'Motor repair'],
  },
  {
    id: 17,
    title: 'Security Guards',
    description: 'Professional security guards for your safety',
    category: 'security',
    price: 'Varies',
    icon: '🛡️',
    features: ['Trained guards', '24/7 shifts', 'Background verified'],
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
