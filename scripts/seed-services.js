// Run this script to seed all 36 services to MongoDB
// Usage: node scripts/seed-services.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  console.log('Make sure .env.local exists with MONGODB_URI');
  process.exit(1);
}

// Service Schema (matching your Service model)
const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: String, default: 'Varies' },
  icon: { type: String, default: '🏠' },
  features: [{ type: String }],
  popular: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema);

// All 36 Yann Services (NEW)
const SERVICES = [
  // ===== DRIVER SERVICES (3) =====
  {
    title: 'Full-Day Personal Driver',
    description: 'Full-day personal driver for your transportation needs',
    category: 'driver',
    price: 'Varies',
    icon: '🚙',
    popular: true,
    features: ['Full-day service', 'All routes', 'Professional & courteous'],
    order: 1
  },
  {
    title: 'Outstation Driving Service',
    description: 'Long-distance and outstation driving services',
    category: 'driver',
    price: 'Varies',
    icon: '🛣️',
    popular: false,
    features: ['Long-distance trips', 'Experienced drivers', 'Safe & reliable'],
    order: 2
  },

  // ===== PUJARI SERVICES (20) =====
  {
    title: 'Lakshmi Puja',
    description: 'Lakshmi Puja ceremony for prosperity and wealth',
    category: 'pujari',
    price: 'Varies',
    icon: '✨',
    popular: true,
    features: ['Home puja', 'Complete rituals', 'Priest included'],
    order: 3
  },
  {
    title: 'Satyanarayan Katha',
    description: 'Traditional Satyanarayan Katha ceremony at home',
    category: 'pujari',
    price: 'Varies',
    icon: '📖',
    popular: false,
    features: ['Full ceremony', 'Priest & materials', 'Traditional method'],
    order: 4
  },
  {
    title: 'Ganesh Puja at Home',
    description: 'Ganesh Puja ceremony performed at your home',
    category: 'pujari',
    price: 'Varies',
    icon: '🐘',
    popular: true,
    features: ['Home ceremony', 'All rituals', 'Complete setup'],
    order: 5
  },
  {
    title: 'Griha Pravesh Puja',
    description: 'New house blessing and Griha Pravesh ceremony',
    category: 'pujari',
    price: 'Varies',
    icon: '🏠',
    popular: true,
    features: ['House blessing', 'Complete rituals', 'Expert priest'],
    order: 6
  },
  {
    title: 'Vastu Shanti Puja',
    description: 'Vastu Shanti ceremony to balance home energies',
    category: 'pujari',
    price: 'Varies',
    icon: '⚖️',
    popular: false,
    features: ['Energy balancing', 'Expert guidance', 'Full ritual'],
    order: 7
  },
  {
    title: 'Havan Ceremony',
    description: 'Holy Havan ceremony with fire rituals',
    category: 'pujari',
    price: 'Varies',
    icon: '🔥',
    popular: false,
    features: ['Fire rituals', 'Vedic chanting', 'All materials included'],
    order: 8
  },
  {
    title: 'Rudrabhishek Puja',
    description: 'Sacred Rudrabhishek ceremony for Lord Shiva',
    category: 'pujari',
    price: 'Varies',
    icon: '🕉️',
    popular: false,
    features: ['Holy ceremony', 'Expert priest', 'All materials'],
    order: 9
  },
  {
    title: 'Vivah (Wedding Ceremony)',
    description: 'Complete wedding ceremony with traditional rituals',
    category: 'pujari',
    price: 'Varies',
    icon: '💒',
    popular: true,
    features: ['Full ceremony', 'Multiple priests', 'Complete setup'],
    order: 10
  },
  {
    title: 'Ring Ceremony',
    description: 'Ring ceremony and engagement rituals',
    category: 'pujari',
    price: 'Varies',
    icon: '💍',
    popular: false,
    features: ['Engagement ceremony', 'Expert priests', 'Full ritual'],
    order: 11
  },
  {
    title: 'Ramayan Path',
    description: 'Continuous recitation of the Ramayan',
    category: 'pujari',
    price: 'Varies',
    icon: '📚',
    popular: false,
    features: ['Vedic recitation', 'Experienced priests', 'Sacred ritual'],
    order: 12
  },
  {
    title: 'Mahamrityunjay Jaap',
    description: 'Sacred Mahamrityunjay mantra chanting ceremony',
    category: 'pujari',
    price: 'Varies',
    icon: '💫',
    popular: false,
    features: ['Healing ceremony', 'Mantra chanting', 'Spiritual benefit'],
    order: 13
  },
  {
    title: 'Gayatri Jaap',
    description: 'Gayatri mantra recitation ceremony',
    category: 'pujari',
    price: 'Varies',
    icon: '☀️',
    popular: false,
    features: ['Mantra chanting', 'Expert priest', 'Spiritual awakening'],
    order: 14
  },
  {
    title: 'Pitra Shanti Puja',
    description: 'Ancestral peace ceremony for departed souls',
    category: 'pujari',
    price: 'Varies',
    icon: '🕯️',
    popular: false,
    features: ['Ancestor blessing', 'Traditional ritual', 'Expert priest'],
    order: 15
  },
  {
    title: 'Nav Graha Shanti',
    description: 'Nine planets peace ceremony',
    category: 'pujari',
    price: 'Varies',
    icon: '⭐',
    popular: false,
    features: ['Planetary healing', 'Vedic ritual', 'Expert priest'],
    order: 16
  },
  {
    title: 'Bhoomi Poojan',
    description: 'Ground breaking ceremony for construction',
    category: 'pujari',
    price: 'Varies',
    icon: '🏗️',
    popular: false,
    features: ['Construction blessing', 'Complete ritual', 'Safety blessing'],
    order: 17
  },
  {
    title: 'Vaahan Poojan',
    description: 'Vehicle blessing ceremony',
    category: 'pujari',
    price: 'Varies',
    icon: '🚗',
    popular: false,
    features: ['Vehicle blessing', 'Safety ritual', 'Expert priest'],
    order: 18
  },
  {
    title: 'Shraadh Karm',
    description: 'Sacred death ritual ceremony',
    category: 'pujari',
    price: 'Varies',
    icon: '🙏',
    popular: false,
    features: ['Death ritual', 'Traditional ceremony', 'Expert guidance'],
    order: 19
  },
  {
    title: 'Janmadin Poojan',
    description: 'Birthday blessing ceremony',
    category: 'pujari',
    price: 'Varies',
    icon: '🎂',
    popular: false,
    features: ['Birthday blessing', 'Special rituals', 'Expert priest'],
    order: 20
  },
  {
    title: 'Sundarkand Path',
    description: 'Sundar Kand recitation ceremony',
    category: 'pujari',
    price: 'Varies',
    icon: '📖',
    popular: false,
    features: ['Vedic recitation', 'Sacred ceremony', 'Spiritual benefit'],
    order: 21
  },

  // ===== CLEANING SERVICES (13) =====
  {
    title: 'Deep House Cleaning',
    description: 'Thorough deep cleaning of your entire house',
    category: 'cleaning',
    price: 'Varies',
    icon: '🏠',
    popular: true,
    features: ['Complete deep clean', 'All rooms', 'Professional equipment'],
    order: 22
  },
  {
    title: 'Regular House Cleaning',
    description: 'Regular maintenance cleaning for your home',
    category: 'cleaning',
    price: 'Varies',
    icon: '✨',
    popular: true,
    features: ['Weekly/monthly service', 'Reliable team', 'Flexible schedule'],
    order: 23
  },
  {
    title: 'Bathroom Deep Clean',
    description: 'Specialized bathroom and toilet deep cleaning',
    category: 'cleaning',
    price: 'Varies',
    icon: '🚽',
    popular: false,
    features: ['Deep sanitization', 'Odor removal', 'Professional products'],
    order: 24
  },
  {
    title: 'Move-in/Move-out Cleaning',
    description: 'Complete cleaning for moving in or out',
    category: 'cleaning',
    price: 'Varies',
    icon: '📦',
    popular: false,
    features: ['Thorough cleaning', 'Deposit protection', 'Fast service'],
    order: 25
  },
  {
    title: 'Kitchen Deep Clean',
    description: 'Professional kitchen deep cleaning service',
    category: 'cleaning',
    price: 'Varies',
    icon: '🍳',
    popular: false,
    features: ['Appliance cleaning', 'Degreasing', 'Sanitization'],
    order: 26
  },
  {
    title: 'Office Cleaning',
    description: 'Professional office space cleaning',
    category: 'cleaning',
    price: 'Varies',
    icon: '🏢',
    popular: false,
    features: ['Office maintenance', 'Daily/weekly service', 'Professional team'],
    order: 27
  },
  {
    title: 'Laundry & Ironing',
    description: 'Professional laundry and ironing service',
    category: 'cleaning',
    price: 'Varies',
    icon: '👔',
    popular: false,
    features: ['Washing & ironing', 'Careful handling', 'Quick turnaround'],
    order: 28
  },
  {
    title: 'Sofa & Upholstery Clean',
    description: 'Sofa, upholstery and fabric cleaning',
    category: 'cleaning',
    price: 'Varies',
    icon: '🛋️',
    popular: false,
    features: ['Fabric safe', 'Stain removal', 'Fresh & clean'],
    order: 29
  },
  {
    title: 'Post-Construction Cleaning',
    description: 'Complete cleaning after construction work',
    category: 'cleaning',
    price: 'Varies',
    icon: '🏗️',
    popular: false,
    features: ['Dust removal', 'Professional team', 'Complete cleanup'],
    order: 30
  },
  {
    title: 'Dry Cleaning Service',
    description: 'Professional dry cleaning for clothes',
    category: 'cleaning',
    price: 'Varies',
    icon: '👕',
    popular: false,
    features: ['Expert cleaning', 'Stain removal', 'Quick service'],
    order: 31
  },
  {
    title: 'Carpet Cleaning',
    description: 'Professional carpet and rug cleaning',
    category: 'cleaning',
    price: 'Varies',
    icon: '🧺',
    popular: false,
    features: ['Deep cleaning', 'Stain removal', 'Fresh carpets'],
    order: 32
  },
  {
    title: 'Chimney & Exhaust Cleaning',
    description: 'Kitchen chimney and exhaust cleaning service',
    category: 'cleaning',
    price: 'Varies',
    icon: '🌬️',
    popular: false,
    features: ['Deep cleaning', 'Filter replacement', 'Professional service'],
    order: 33
  },
  {
    title: 'Water Tank Cleaning',
    description: 'Water tank and pipeline cleaning service',
    category: 'cleaning',
    price: 'Varies',
    icon: '💧',
    popular: false,
    features: ['Sanitization', 'Professional equipment', 'Safe drinking water'],
    order: 34
  },
  {
    title: 'Window Cleaning',
    description: 'Professional window cleaning service',
    category: 'cleaning',
    price: 'Varies',
    icon: '🪟',
    popular: false,
    features: ['Glass cleaning', 'Frame cleaning', 'High-rise service'],
    order: 35
  },
  {
    title: 'Balcony Cleaning',
    description: 'Complete balcony and terrace cleaning',
    category: 'cleaning',
    price: 'Varies',
    icon: '🌳',
    popular: false,
    features: ['Floor cleaning', 'Railing cleaning', 'Disinfection'],
    order: 36
  }
];

async function seedServices() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete ALL existing services first
    console.log('\n🗑️  Deleting all existing services...');
    const deleteResult = await Service.deleteMany({});
    console.log(`   Deleted ${deleteResult.deletedCount} old services`);

    console.log('\n📦 Seeding 36 services...\n');

    let created = 0;

    for (const service of SERVICES) {
      await Service.create({ ...service, isActive: true });
      console.log(`  ✅ Created: ${service.title}`);
      created++;
    }

    console.log('\n' + '='.repeat(40));
    console.log(`📊 Summary:`);
    console.log(`   Deleted: ${deleteResult.deletedCount} old services`);
    console.log(`   Created: ${created} new services`);
    console.log('='.repeat(40));

    // Verify
    const totalInDB = await Service.countDocuments();
    console.log(`\n✅ Total services in database: ${totalInDB}`);

  } catch (error) {
    console.error('❌ Error seeding services:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

seedServices();
