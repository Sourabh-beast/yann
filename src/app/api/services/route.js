import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Service from '@/models/Service';

// Static fallback services if database is empty - All 36 Yann services
const STATIC_SERVICES = [
  // ===== DRIVER SERVICES (2) =====
  {
    id: 1,
    title: 'Full-Day Personal Driver',
    description: 'Full-day personal driver for your transportation needs',
    category: 'driver',
    price: 'Varies',
    icon: '🚙',
    popular: true,
    features: ['Full-day service', 'All routes', 'Professional & courteous'],
  },
  {
    id: 2,
    title: 'Outstation Driving Service',
    description: 'Long-distance and outstation driving services',
    category: 'driver',
    price: 'Varies',
    icon: '🛣️',
    popular: false,
    features: ['Long-distance trips', 'Experienced drivers', 'Safe & reliable'],
  },

  // ===== PUJARI SERVICES (20) =====
  {
    id: 3,
    title: 'Lakshmi Puja',
    description: 'Lakshmi Puja ceremony for prosperity and wealth',
    category: 'pujari',
    price: 'Varies',
    icon: '✨',
    popular: true,
    features: ['Home puja', 'Complete rituals', 'Priest included'],
  },
  {
    id: 4,
    title: 'Satyanarayan Katha',
    description: 'Traditional Satyanarayan Katha ceremony at home',
    category: 'pujari',
    price: 'Varies',
    icon: '📖',
    popular: false,
    features: ['Full ceremony', 'Priest & materials', 'Traditional method'],
  },
  {
    id: 5,
    title: 'Ganesh Puja at Home',
    description: 'Ganesh Puja ceremony performed at your home',
    category: 'pujari',
    price: 'Varies',
    icon: '🐘',
    popular: true,
    features: ['Home ceremony', 'All rituals', 'Complete setup'],
  },
  {
    id: 6,
    title: 'Griha Pravesh Puja',
    description: 'New house blessing and Griha Pravesh ceremony',
    category: 'pujari',
    price: 'Varies',
    icon: '🏠',
    popular: true,
    features: ['House blessing', 'Complete rituals', 'Expert priest'],
  },
  {
    id: 7,
    title: 'Vastu Shanti Puja',
    description: 'Vastu Shanti ceremony to balance home energies',
    category: 'pujari',
    price: 'Varies',
    icon: '⚖️',
    popular: false,
    features: ['Energy balancing', 'Expert guidance', 'Full ritual'],
  },
  {
    id: 8,
    title: 'Havan Ceremony',
    description: 'Holy Havan ceremony with fire rituals',
    category: 'pujari',
    price: 'Varies',
    icon: '🔥',
    popular: false,
    features: ['Fire rituals', 'Vedic chanting', 'All materials included'],
  },
  {
    id: 9,
    title: 'Rudrabhishek Puja',
    description: 'Sacred Rudrabhishek ceremony for Lord Shiva',
    category: 'pujari',
    price: 'Varies',
    icon: '🕉️',
    popular: false,
    features: ['Holy ceremony', 'Expert priest', 'All materials'],
  },
  {
    id: 10,
    title: 'Vivah (Wedding Ceremony)',
    description: 'Complete wedding ceremony with traditional rituals',
    category: 'pujari',
    price: 'Varies',
    icon: '💒',
    popular: true,
    features: ['Full ceremony', 'Multiple priests', 'Complete setup'],
  },
  {
    id: 11,
    title: 'Ring Ceremony',
    description: 'Ring ceremony and engagement rituals',
    category: 'pujari',
    price: 'Varies',
    icon: '💍',
    popular: false,
    features: ['Engagement ceremony', 'Expert priests', 'Full ritual'],
  },
  {
    id: 12,
    title: 'Ramayan Path',
    description: 'Continuous recitation of the Ramayan',
    category: 'pujari',
    price: 'Varies',
    icon: '📚',
    popular: false,
    features: ['Vedic recitation', 'Experienced priests', 'Sacred ritual'],
  },
  {
    id: 13,
    title: 'Mahamrityunjay Jaap',
    description: 'Sacred Mahamrityunjay mantra chanting ceremony',
    category: 'pujari',
    price: 'Varies',
    icon: '💫',
    popular: false,
    features: ['Healing ceremony', 'Mantra chanting', 'Spiritual benefit'],
  },
  {
    id: 14,
    title: 'Gayatri Jaap',
    description: 'Gayatri mantra recitation ceremony',
    category: 'pujari',
    price: 'Varies',
    icon: '☀️',
    popular: false,
    features: ['Mantra chanting', 'Expert priest', 'Spiritual awakening'],
  },
  {
    id: 15,
    title: 'Pitra Shanti Puja',
    description: 'Ancestral peace ceremony for departed souls',
    category: 'pujari',
    price: 'Varies',
    icon: '🕯️',
    popular: false,
    features: ['Ancestor blessing', 'Traditional ritual', 'Expert priest'],
  },
  {
    id: 16,
    title: 'Nav Graha Shanti',
    description: 'Nine planets peace ceremony',
    category: 'pujari',
    price: 'Varies',
    icon: '⭐',
    popular: false,
    features: ['Planetary healing', 'Vedic ritual', 'Expert priest'],
  },
  {
    id: 17,
    title: 'Bhoomi Poojan',
    description: 'Ground breaking ceremony for construction',
    category: 'pujari',
    price: 'Varies',
    icon: '🏗️',
    popular: false,
    features: ['Construction blessing', 'Complete ritual', 'Safety blessing'],
  },
  {
    id: 18,
    title: 'Vaahan Poojan',
    description: 'Vehicle blessing ceremony',
    category: 'pujari',
    price: 'Varies',
    icon: '🚙',
    popular: false,
    features: ['Vehicle blessing', 'Safety ritual', 'Expert priest'],
  },
  {
    id: 19,
    title: 'Shraadh Karm',
    description: 'Sacred death ritual ceremony',
    category: 'pujari',
    price: 'Varies',
    icon: '🙏',
    popular: false,
    features: ['Death ritual', 'Traditional ceremony', 'Expert guidance'],
  },
  {
    id: 20,
    title: 'Janmadin Poojan',
    description: 'Birthday blessing ceremony',
    category: 'pujari',
    price: 'Varies',
    icon: '🎂',
    popular: false,
    features: ['Birthday blessing', 'Special rituals', 'Expert priest'],
  },
  {
    id: 21,
    title: 'Sundarkand Path',
    description: 'Sundar Kand recitation ceremony',
    category: 'pujari',
    price: 'Varies',
    icon: '📖',
    popular: false,
    features: ['Vedic recitation', 'Sacred ceremony', 'Spiritual benefit'],
  },

  // ===== CLEANING SERVICES (13) =====
  {
    id: 22,
    title: 'Deep House Cleaning',
    description: 'Thorough deep cleaning of your entire house',
    category: 'cleaning',
    price: 'Varies',
    icon: '🏠',
    popular: true,
    features: ['Complete deep clean', 'All rooms', 'Professional equipment'],
  },
  {
    id: 23,
    title: 'Regular House Cleaning',
    description: 'Regular maintenance cleaning for your home',
    category: 'cleaning',
    price: 'Varies',
    icon: '✨',
    popular: true,
    features: ['Weekly/monthly service', 'Reliable team', 'Flexible schedule'],
  },
  {
    id: 24,
    title: 'Bathroom Deep Clean',
    description: 'Specialized bathroom and toilet deep cleaning',
    category: 'cleaning',
    price: 'Varies',
    icon: '🚽',
    popular: false,
    features: ['Deep sanitization', 'Odor removal', 'Professional products'],
  },
  {
    id: 25,
    title: 'Move-in/Move-out Cleaning',
    description: 'Complete cleaning for moving in or out',
    category: 'cleaning',
    price: 'Varies',
    icon: '📦',
    popular: false,
    features: ['Thorough cleaning', 'Deposit protection', 'Fast service'],
  },
  {
    id: 26,
    title: 'Kitchen Deep Clean',
    description: 'Professional kitchen deep cleaning service',
    category: 'cleaning',
    price: 'Varies',
    icon: '🍳',
    popular: false,
    features: ['Appliance cleaning', 'Degreasing', 'Sanitization'],
  },
  {
    id: 27,
    title: 'Office Cleaning',
    description: 'Professional office space cleaning',
    category: 'cleaning',
    price: 'Varies',
    icon: '🏢',
    popular: false,
    features: ['Office maintenance', 'Daily/weekly service', 'Professional team'],
  },
  {
    id: 28,
    title: 'Laundry & Ironing',
    description: 'Professional laundry and ironing service',
    category: 'cleaning',
    price: 'Varies',
    icon: '👔',
    popular: false,
    features: ['Washing & ironing', 'Careful handling', 'Quick turnaround'],
  },
  {
    id: 29,
    title: 'Sofa & Upholstery Clean',
    description: 'Sofa, upholstery and fabric cleaning',
    category: 'cleaning',
    price: 'Varies',
    icon: '🛋️',
    popular: false,
    features: ['Fabric safe', 'Stain removal', 'Fresh & clean'],
  },
  {
    id: 30,
    title: 'Post-Construction Cleaning',
    description: 'Complete cleaning after construction work',
    category: 'cleaning',
    price: 'Varies',
    icon: '🏗️',
    popular: false,
    features: ['Dust removal', 'Professional team', 'Complete cleanup'],
  },
  {
    id: 31,
    title: 'Dry Cleaning Service',
    description: 'Professional dry cleaning for clothes',
    category: 'cleaning',
    price: 'Varies',
    icon: '👕',
    popular: false,
    features: ['Expert cleaning', 'Stain removal', 'Quick service'],
  },
  {
    id: 32,
    title: 'Carpet Cleaning',
    description: 'Professional carpet and rug cleaning',
    category: 'cleaning',
    price: 'Varies',
    icon: '🧺',
    popular: false,
    features: ['Deep cleaning', 'Stain removal', 'Fresh carpets'],
  },
  {
    id: 33,
    title: 'Chimney & Exhaust Cleaning',
    description: 'Kitchen chimney and exhaust cleaning service',
    category: 'cleaning',
    price: 'Varies',
    icon: '🔥',
    popular: false,
    features: ['Deep cleaning', 'Filter replacement', 'Professional service'],
  },
  {
    id: 34,
    title: 'Water Tank Cleaning',
    description: 'Water tank and pipeline cleaning service',
    category: 'cleaning',
    price: 'Varies',
    icon: '💧',
    popular: false,
    features: ['Sanitization', 'Professional equipment', 'Safe drinking water'],
  },
  {
    id: 35,
    title: 'Window Cleaning',
    description: 'Professional window cleaning service',
    category: 'cleaning',
    price: 'Varies',
    icon: '🪟',
    popular: false,
    features: ['Glass cleaning', 'Frame cleaning', 'High-rise service'],
  },
  {
    id: 36,
    title: 'Balcony Cleaning',
    description: 'Complete balcony and terrace cleaning',
    category: 'cleaning',
    price: 'Varies',
    icon: '🌳',
    popular: false,
    features: ['Floor cleaning', 'Railing cleaning', 'Disinfection'],
  },
];

/**
 * GET /api/services
 * Fetch all services from MongoDB
 * Query params: category (optional)
 */
// Simple in-memory cache
let cache = {
  data: null,
  timestamp: 0
};
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes (Services rarely change)

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // Check cache (only for full list without filters, to keep it simple)
    const now = Date.now();
    if (!category && cache.data && (now - cache.timestamp < CACHE_TTL)) {
      return NextResponse.json({
        success: true,
        data: cache.data,
        cached: true
      });
    }

    await connectDB();

    // Build query - only active services
    const query = { isActive: { $ne: false } };
    if (category) {
      query.category = category;
    }

    // Get services from database
    const services = await Service.find(query)
      .sort({ order: 1, popular: -1, createdAt: -1 })
      .select('-__v')
      .lean();

    // If no services in database, return static services as fallback
    if (services.length === 0) {
      console.log('No services in database, returning static fallback');
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

    // Update cache if no filter
    if (!category) {
      cache = {
        data: mappedServices,
        timestamp: Date.now()
      };
    }

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
