import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Service from '@/models/Service';
import { getOrSetCache } from '@/lib/cache';

const DEFAULT_MAX_BY_CATEGORY = {
  driver: 2000,
  pujari: 25000,
  cleaning: 5000,
  laundry: 2000,
  electrical: 4000,
  'appliance-repair': 12000,
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

  'Light Fitting': 1200,
  'Fan Fitting': 1500,
  'Fan Repair': 2000,
  'Switch and Socket Repair': 1800,
  'Short Circuit Troubleshooting': 2500,
  'MCB and Fuse Repair': 2200,
  'Wiring and Rewiring': 5000,
  'Water Pump Repair': 3500,
  'Starter Repair': 2800,
  'Cooler Repair': 3000,

  'AC Service and Repair': 5000,
  'Window AC Installation': 4500,
  'Split AC Installation': 6000,
  'Window AC Service': 3500,
  'Split AC Service': 3800,
  'Window AC Water Leakage': 4200,
  'Split AC Water Leakage': 4500,
  'AC Noise and Start Issue': 4500,
  'Refrigerator Repair': 5000,
  'Washing Machine Repair': 5500,
  'Microwave Repair': 4500,
  'LCD/LED TV Repair': 7000,
  'Music System Repair': 5000,
  'Induction Cooktop Repair': 3500,
  'Iron Repair': 1800,
  'Juicer Mixer Grinder Repair': 3000,

  'Other': 5000,
};

const DEFAULT_EXPERIENCE_RANGES = [
  { minYears: 0, maxYears: 5 },
  { minYears: 5, maxYears: 10 },
  { minYears: 10, maxYears: 15 },
  { minYears: 15, maxYears: 20 },
  { minYears: 20, maxYears: 25 },
  { minYears: 25, maxYears: 30 },
  { minYears: 30, maxYears: null },
];

const buildDefaultExperienceLimits = (category, title) => {
  const defaultMax = DEFAULT_MAX_BY_SERVICE[title] || DEFAULT_MAX_BY_CATEGORY[category] || 0;
  return DEFAULT_EXPERIENCE_RANGES.map(range => ({
    ...range,
    maxPrice: defaultMax,
  }));
};

const applyDefaultLimits = (service) => ({
  ...service,
  basePrice: service.basePrice || 0,
  minPrice: service.minPrice || 0,
  maxPrice: service.maxPrice || DEFAULT_MAX_BY_SERVICE[service.title] || DEFAULT_MAX_BY_CATEGORY[service.category] || 0,
  experiencePriceLimits: Array.isArray(service.experiencePriceLimits) && service.experiencePriceLimits.length > 0
    ? service.experiencePriceLimits
    : buildDefaultExperienceLimits(service.category, service.title)
});

// Static fallback services if database is empty.
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
  {
    id: 37,
    title: 'Light Fitting',
    description: 'Installation and replacement of indoor or outdoor light fixtures',
    category: 'electrical',
    price: 'Varies',
    icon: '💡',
    popular: true,
    features: ['Ceiling lights', 'Wall lights', 'Safe wiring checks'],
  },
  {
    id: 38,
    title: 'Fan Fitting',
    description: 'Ceiling and wall fan installation by trained electricians',
    category: 'electrical',
    price: 'Varies',
    icon: '🌀',
    popular: true,
    features: ['New fitting', 'Alignment checks', 'Safety testing'],
  },
  {
    id: 39,
    title: 'Fan Repair',
    description: 'Fan noise, speed, capacitor and motor issue repair',
    category: 'electrical',
    price: 'Varies',
    icon: '🛠️',
    popular: false,
    features: ['Capacitor replacement', 'Motor checks', 'Wiring fixes'],
  },
  {
    id: 40,
    title: 'Switch and Socket Repair',
    description: 'Switchboard, socket and minor wiring fault repair',
    category: 'electrical',
    price: 'Varies',
    icon: '🔌',
    popular: false,
    features: ['Switch replacement', 'Socket repair', 'Loose connection fix'],
  },
  {
    id: 41,
    title: 'Short Circuit Troubleshooting',
    description: 'Diagnosis and repair of short-circuit and trip issues',
    category: 'electrical',
    price: 'Varies',
    icon: '⚡',
    popular: true,
    features: ['Fault tracing', 'Load checks', 'Safe restoration'],
  },
  {
    id: 42,
    title: 'MCB and Fuse Repair',
    description: 'MCB, fuse and distribution board related repair work',
    category: 'electrical',
    price: 'Varies',
    icon: '🧰',
    popular: false,
    features: ['MCB replacement', 'Fuse fix', 'DB inspection'],
  },
  {
    id: 43,
    title: 'Wiring and Rewiring',
    description: 'Partial or full rewiring for homes and offices',
    category: 'electrical',
    price: 'Varies',
    icon: '🧵',
    popular: false,
    features: ['New wiring', 'Old wire replacement', 'Load planning'],
  },
  {
    id: 44,
    title: 'Water Pump Repair',
    description: 'Residential water pump wiring and motor issue repair',
    category: 'electrical',
    price: 'Varies',
    icon: '🚰',
    popular: false,
    features: ['Motor check', 'Starter check', 'Power line fix'],
  },
  {
    id: 45,
    title: 'Starter Repair',
    description: 'Starter panel and starter circuit troubleshooting',
    category: 'electrical',
    price: 'Varies',
    icon: '🎛️',
    popular: false,
    features: ['Panel diagnosis', 'Relay checks', 'Component replacement'],
  },
  {
    id: 46,
    title: 'Cooler Repair',
    description: 'Air cooler motor, pump and electrical fault repair',
    category: 'electrical',
    price: 'Varies',
    icon: '❄️',
    popular: false,
    features: ['Motor service', 'Pump repair', 'Cooling check'],
  },
  {
    id: 47,
    title: 'AC Service and Repair',
    description: 'General AC service and diagnosis for cooling issues',
    category: 'appliance-repair',
    price: 'Varies',
    icon: '🌬️',
    popular: true,
    features: ['General service', 'Cooling check', 'Gas pressure check'],
  },
  {
    id: 48,
    title: 'Window AC Installation',
    description: 'Professional window AC fitting and setup',
    category: 'appliance-repair',
    price: 'Varies',
    icon: '🪟',
    popular: false,
    features: ['Mounting', 'Power check', 'Test run'],
  },
  {
    id: 49,
    title: 'Split AC Installation',
    description: 'Indoor/outdoor unit installation with piping checks',
    category: 'appliance-repair',
    price: 'Varies',
    icon: '🏡',
    popular: true,
    features: ['Unit fitting', 'Pipe setup', 'Performance check'],
  },
  {
    id: 50,
    title: 'Window AC Service',
    description: 'Routine cleaning and service of window AC units',
    category: 'appliance-repair',
    price: 'Varies',
    icon: '🧼',
    popular: false,
    features: ['Filter cleaning', 'Coil clean', 'Airflow check'],
  },
  {
    id: 51,
    title: 'Split AC Service',
    description: 'Routine cleaning and performance service for split AC',
    category: 'appliance-repair',
    price: 'Varies',
    icon: '🛋️',
    popular: false,
    features: ['Indoor unit clean', 'Outdoor wash', 'Cooling tune-up'],
  },
  {
    id: 52,
    title: 'Window AC Water Leakage',
    description: 'Drain and leakage issue repair for window AC units',
    category: 'appliance-repair',
    price: 'Varies',
    icon: '💧',
    popular: false,
    features: ['Drain cleaning', 'Leak trace', 'Seal correction'],
  },
  {
    id: 53,
    title: 'Split AC Water Leakage',
    description: 'Drain line and indoor leakage troubleshooting for split AC',
    category: 'appliance-repair',
    price: 'Varies',
    icon: '🌊',
    popular: false,
    features: ['Drain unclog', 'Pipe correction', 'Leak prevention'],
  },
  {
    id: 54,
    title: 'AC Noise and Start Issue',
    description: 'Compressor, capacitor and startup issue diagnosis',
    category: 'appliance-repair',
    price: 'Varies',
    icon: '🔊',
    popular: false,
    features: ['Noise diagnosis', 'Startup fix', 'Component checks'],
  },
  {
    id: 55,
    title: 'Refrigerator Repair',
    description: 'Cooling, gas, thermostat and electrical fridge repairs',
    category: 'appliance-repair',
    price: 'Varies',
    icon: '🧊',
    popular: true,
    features: ['Cooling fix', 'Thermostat checks', 'Gas top-up'],
  },
  {
    id: 56,
    title: 'Washing Machine Repair',
    description: 'Drum, motor, inlet and drain related machine repairs',
    category: 'appliance-repair',
    price: 'Varies',
    icon: '🧺',
    popular: true,
    features: ['Spin issues', 'Drain fix', 'Motor checks'],
  },
  {
    id: 57,
    title: 'Microwave Repair',
    description: 'Microwave heating and control board troubleshooting',
    category: 'appliance-repair',
    price: 'Varies',
    icon: '📡',
    popular: false,
    features: ['Heating fix', 'Door switch check', 'Board repair'],
  },
  {
    id: 58,
    title: 'LCD/LED TV Repair',
    description: 'Display, power and audio issues for TV units',
    category: 'appliance-repair',
    price: 'Varies',
    icon: '📺',
    popular: false,
    features: ['Power issues', 'Display diagnostics', 'Sound fixes'],
  },
  {
    id: 59,
    title: 'Music System Repair',
    description: 'Speaker and amplifier level diagnostics and repairs',
    category: 'appliance-repair',
    price: 'Varies',
    icon: '🎵',
    popular: false,
    features: ['Audio checks', 'Amplifier repair', 'Power board fix'],
  },
  {
    id: 60,
    title: 'Induction Cooktop Repair',
    description: 'Induction plate not heating or display issue fixes',
    category: 'appliance-repair',
    price: 'Varies',
    icon: '🍳',
    popular: false,
    features: ['Heating diagnostics', 'Sensor checks', 'Board service'],
  },
  {
    id: 61,
    title: 'Iron Repair',
    description: 'Electric iron heating and cord issue repair',
    category: 'appliance-repair',
    price: 'Varies',
    icon: '🧷',
    popular: false,
    features: ['Heating element check', 'Cord repair', 'Switch service'],
  },
  {
    id: 62,
    title: 'Juicer Mixer Grinder Repair',
    description: 'Mixer motor, jar lock and blade issue troubleshooting',
    category: 'appliance-repair',
    price: 'Varies',
    icon: '🥤',
    popular: false,
    features: ['Motor repair', 'Blade replacement', 'Speed control fix'],
  },
];

/**
 * GET /api/services
 * Fetch all services from MongoDB
 * Query params: category (optional)
 */
const SERVICES_CACHE_KEY = 'cache:services:all';
const SERVICES_CACHE_TTL_SECONDS = 30 * 60; // 30 minutes (Services rarely change)

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // Cache only the full unfiltered list (mirrors the prior in-memory cache's
    // scope), now backed by Redis so the cache is shared across serverless
    // instances instead of being per-instance.
    if (!category) {
      const mappedServices = await getOrSetCache(SERVICES_CACHE_KEY, SERVICES_CACHE_TTL_SECONDS, async () => {
        await connectDB();
        const services = await Service.find({ isActive: { $ne: false } })
          .sort({ order: 1, popular: -1, createdAt: -1 })
          .select('-__v')
          .lean();

        if (services.length === 0) return null; // don't cache the empty/fallback state

        return services.map(service => ({
          id: service._id.toString(),
          title: service.title,
          description: service.description,
          category: service.category,
          price: service.price,
          basePrice: service.basePrice || 0,
          minPrice: service.minPrice || 0,
          maxPrice: service.maxPrice || DEFAULT_MAX_BY_SERVICE[service.title] || DEFAULT_MAX_BY_CATEGORY[service.category] || 0,
          experiencePriceLimits: Array.isArray(service.experiencePriceLimits) && service.experiencePriceLimits.length > 0
            ? service.experiencePriceLimits
            : buildDefaultExperienceLimits(service.category, service.title),
          features: service.features || [],
          icon: service.icon || '🏠',
          popular: service.popular || false,
        }));
      });

      if (mappedServices === null) {
        console.log('No services in database, returning static fallback');
        return NextResponse.json({
          success: true,
          data: STATIC_SERVICES.map(applyDefaultLimits),
        });
      }

      return NextResponse.json({
        success: true,
        data: mappedServices,
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
          'CDN-Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        }
      });
    }

    await connectDB();

    // Category-filtered path: not cached (mirrors prior behavior)
    const query = { isActive: { $ne: false }, category };

    const services = await Service.find(query)
      .sort({ order: 1, popular: -1, createdAt: -1 })
      .select('-__v')
      .lean();

    if (services.length === 0) {
      console.log('No services in database, returning static fallback');
      const staticData = STATIC_SERVICES.filter(s => s.category === category);
      return NextResponse.json({
        success: true,
        data: staticData.map(applyDefaultLimits),
      });
    }

    const mappedServices = services.map(service => ({
      id: service._id.toString(),
      title: service.title,
      description: service.description,
      category: service.category,
      price: service.price,
      basePrice: service.basePrice || 0,
      minPrice: service.minPrice || 0,
      maxPrice: service.maxPrice || DEFAULT_MAX_BY_SERVICE[service.title] || DEFAULT_MAX_BY_CATEGORY[service.category] || 0,
      experiencePriceLimits: Array.isArray(service.experiencePriceLimits) && service.experiencePriceLimits.length > 0
        ? service.experiencePriceLimits
        : buildDefaultExperienceLimits(service.category, service.title),
      features: service.features || [],
      icon: service.icon || '🏠',
      popular: service.popular || false,
    }));

    return NextResponse.json({
      success: true,
      data: mappedServices,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        'CDN-Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      }
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    // Return static services on error
    return NextResponse.json({
      success: true,
      data: STATIC_SERVICES.map(applyDefaultLimits),
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
