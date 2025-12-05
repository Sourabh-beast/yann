// Run this script to seed all 17 services to MongoDB
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

// All 17 Yann Services
const SERVICES = [
  {
    title: 'Drivers',
    description: 'Professional drivers for your transportation needs',
    category: 'driver',
    price: 'Varies',
    icon: '🚗',
    popular: true,
    features: ['Licensed drivers', 'Flexible hours', 'Background verified'],
    order: 1
  },
  {
    title: 'Pujari',
    description: 'Experienced pujaris for religious ceremonies',
    category: 'pujari',
    price: 'Varies',
    icon: '🙏',
    popular: true,
    features: ['Experienced pujaris', 'All rituals', 'Timely service'],
    order: 2
  },
  {
    title: 'Maids',
    description: 'Reliable maids for household cleaning',
    category: 'cleaning',
    price: 'Varies',
    icon: '🧹',
    popular: true,
    features: ['Daily cleaning', 'Background verified', 'Flexible timing'],
    order: 3
  },
  {
    title: 'Baby Sitters',
    description: 'Trusted baby sitters for childcare',
    category: 'childcare',
    price: 'Varies',
    icon: '👶',
    popular: true,
    features: ['Experienced caregivers', 'Background verified', 'Day/night shifts'],
    order: 4
  },
  {
    title: 'Nurses',
    description: 'Qualified nurses for healthcare needs',
    category: 'healthcare',
    price: 'Varies',
    icon: '👩‍⚕️',
    popular: true,
    features: ['Certified nurses', '24/7 available', 'Emergency care'],
    order: 5
  },
  {
    title: 'Attendants',
    description: 'Dedicated attendants for elderly and patient care',
    category: 'healthcare',
    price: 'Varies',
    icon: '🤝',
    popular: false,
    features: ['Patient care', 'Elderly support', 'Day/night shifts'],
    order: 6
  },
  {
    title: 'Cleaners',
    description: 'Professional cleaners for deep cleaning',
    category: 'cleaning',
    price: 'Varies',
    icon: '🧽',
    popular: false,
    features: ['Deep cleaning', 'All surfaces', 'Eco-friendly products'],
    order: 7
  },
  {
    title: 'Office Boys',
    description: 'Office support staff for various tasks',
    category: 'assistant',
    price: 'Varies',
    icon: '👔',
    popular: false,
    features: ['Office tasks', 'Document handling', 'Reliable'],
    order: 8
  },
  {
    title: 'Chaprasi',
    description: 'Chaprasi for office and residential support',
    category: 'assistant',
    price: 'Varies',
    icon: '🏢',
    popular: false,
    features: ['Multi-task support', 'Document delivery', 'Office maintenance'],
    order: 9
  },
  {
    title: 'Heena Artists',
    description: 'Skilled heena artists for events and occasions',
    category: 'specialty',
    price: 'Varies',
    icon: '🎨',
    popular: false,
    features: ['Bridal heena', 'Modern designs', 'Natural heena'],
    order: 10
  },
  {
    title: 'AC Service Technicians',
    description: 'Expert AC repair and maintenance',
    category: 'maintenance',
    price: 'Varies',
    icon: '❄️',
    popular: false,
    features: ['All AC brands', 'Installation & repair', 'Maintenance'],
    order: 11
  },
  {
    title: 'RO Service Technicians',
    description: 'RO water purifier service and repair',
    category: 'maintenance',
    price: 'Varies',
    icon: '💧',
    popular: false,
    features: ['All RO brands', 'Installation & repair', 'Filter replacement'],
    order: 12
  },
  {
    title: 'Refrigerator Service Technicians',
    description: 'Refrigerator repair and maintenance',
    category: 'maintenance',
    price: 'Varies',
    icon: '🧊',
    popular: false,
    features: ['All brands', 'Gas refilling', 'Cooling issues'],
    order: 13
  },
  {
    title: 'Air Purifier Service Technicians',
    description: 'Air purifier servicing and filter replacement',
    category: 'maintenance',
    price: 'Varies',
    icon: '🌬️',
    popular: false,
    features: ['All brands', 'Filter replacement', 'Deep cleaning'],
    order: 14
  },
  {
    title: 'Toilet Cleaning Experts',
    description: 'Specialized toilet and bathroom cleaning',
    category: 'cleaning',
    price: 'Varies',
    icon: '🚽',
    popular: false,
    features: ['Deep cleaning', 'Sanitization', 'Odor removal'],
    order: 15
  },
  {
    title: 'Chimney Service Technicians',
    description: 'Kitchen chimney cleaning and repair',
    category: 'maintenance',
    price: 'Varies',
    icon: '🔥',
    popular: false,
    features: ['All brands', 'Deep cleaning', 'Motor repair'],
    order: 16
  },
  {
    title: 'Security Guards',
    description: 'Professional security guards for your safety',
    category: 'security',
    price: 'Varies',
    icon: '🛡️',
    popular: false,
    features: ['Trained guards', '24/7 shifts', 'Background verified'],
    order: 17
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

    console.log('\n📦 Seeding 17 services...\n');

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
