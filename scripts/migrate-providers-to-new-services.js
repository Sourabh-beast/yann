// Migrate providers to the new 52 services (from 17)
// This script assigns providers to specific new services based on their category
// Usage: node scripts/migrate-providers-to-new-services.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

const providerSchema = new mongoose.Schema({
  name: String,
  email: String,
  services: [String],
  serviceRates: [{
    serviceName: String,
    price: Number
  }],
  status: String
}, { strict: false, collection: 'serviceproviders' });

const Provider = mongoose.models.ServiceProvider || mongoose.model('ServiceProvider', providerSchema);

// Mapping from OLD service names to NEW specific service names
// This allows rich assignment of providers to multiple related services
const SERVICE_MIGRATION_MAP = {
  // DRIVER SERVICES
  'Drivers': [
    'Drivers',
    'Full-Day Personal Driver',
    'Outstation Driving Service'
  ],
  'Driver': [
    'Drivers',
    'Full-Day Personal Driver',
    'Outstation Driving Service'
  ],
  'Full-Day Personal Driver': [
    'Drivers',
    'Full-Day Personal Driver',
    'Outstation Driving Service'
  ],
  'Outstation Driving Service': [
    'Drivers',
    'Full-Day Personal Driver',
    'Outstation Driving Service'
  ],

  // PUJARI SERVICES
  'Pujari': [
    'Pujari',
    'Lakshmi Puja',
    'Satyanarayan Katha',
    'Ganesh Puja at Home',
    'Griha Pravesh Puja',
    'Vastu Shanti Puja',
    'Havan Ceremony',
    'Rudrabhishek Puja',
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
  'Pujari Services': [
    'Pujari',
    'Lakshmi Puja',
    'Satyanarayan Katha',
    'Ganesh Puja at Home',
    'Griha Pravesh Puja',
    'Vastu Shanti Puja',
    'Havan Ceremony',
    'Rudrabhishek Puja',
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
  'Satyanarayan Katha': ['Pujari', 'Satyanarayan Katha', 'Lakshmi Puja'],
  'Rudrabhishek Puja': ['Pujari', 'Rudrabhishek Puja', 'Mahamrityunjay Jaap'],
  'Havan Ceremony': ['Pujari', 'Havan Ceremony', 'Lakshmi Puja'],
  'Wedding Rituals': ['Pujari', 'Vivah (Wedding Ceremony)', 'Ring Ceremony'],
  'Griha Pravesh': ['Pujari', 'Griha Pravesh Puja', 'Vastu Shanti Puja'],

  // CLEANING SERVICES
  'Maids': [
    'Maids',
    'Regular House Cleaning',
    'Deep House Cleaning',
    'Office Cleaning'
  ],
  'Cleaners': [
    'Cleaners',
    'Deep House Cleaning',
    'Post-Construction Cleaning',
    'Carpet Cleaning',
    'Water Tank Cleaning'
  ],
  'House Cleaning': [
    'Maids',
    'Regular House Cleaning',
    'Deep House Cleaning'
  ],
  'Deep House Cleaning': [
    'Cleaners',
    'Deep House Cleaning',
    'Post-Construction Cleaning'
  ],
  'Deep Cleaning': [
    'Cleaners',
    'Deep House Cleaning',
    'Kitchen Deep Clean',
    'Bathroom Deep Clean'
  ],
  'Bathroom Cleaning': [
    'Toilet Cleaning Experts',
    'Bathroom Deep Clean'
  ],
  'Laundry Service': [
    'Laundry & Ironing'
  ],
  'Ironing Service': [
    'Laundry & Ironing'
  ],
  'Kitchen Deep Clean': [
    'Kitchen Deep Clean',
    'Sofa & Upholstery Clean'
  ],
  'Toilet Cleaning Experts': [
    'Toilet Cleaning Experts',
    'Bathroom Deep Clean'
  ],
  'Chimney & Exhaust Cleaning': [
    'Chimney & Exhaust Cleaning'
  ],
  'Chimney Service Technicians': [
    'Chimney & Exhaust Cleaning'
  ],

  // OTHER SERVICES (no changes needed as they remain the same)
  'Baby Sitters': ['Baby Sitters'],
  'Nurses': ['Nurses'],
  'Attendants': ['Attendants'],
  'Office Boys': ['Office Boys'],
  'Chaprasi': ['Chaprasi'],
  'Heena Artists': ['Heena Artists'],
  'AC Service Technicians': ['AC Service Technicians'],
  'RO Service Technicians': ['RO Service Technicians'],
  'Refrigerator Service Technicians': ['Refrigerator Service Technicians'],
  'Air Purifier Service Technicians': ['Air Purifier Service Technicians'],
  'Security Guards': ['Security Guards'],
};

async function migrateProviders() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected\n');

    const providers = await Provider.find({});
    console.log(`📋 Found ${providers.length} providers to migrate\n`);
    console.log('='.repeat(70));

    let updated = 0;
    const migrationSummary = {};

    for (const provider of providers) {
      console.log(`\n👤 ${provider.name}:`);
      console.log(`   Old services: [${provider.services?.join(', ') || 'NONE'}]`);
      
      // Collect all new services for this provider
      const newServicesSet = new Set();
      const newServiceRates = [];
      
      for (const oldService of (provider.services || [])) {
        const newServices = SERVICE_MIGRATION_MAP[oldService];
        if (newServices && Array.isArray(newServices)) {
          newServices.forEach(s => {
            newServicesSet.add(s);
            if (!migrationSummary[s]) {
              migrationSummary[s] = 0;
            }
            migrationSummary[s]++;
          });
          console.log(`   ✅ "${oldService}" → [${newServices.join(', ')}]`);
        } else {
          // Keep as-is if no mapping
          newServicesSet.add(oldService);
          if (!migrationSummary[oldService]) {
            migrationSummary[oldService] = 0;
          }
          migrationSummary[oldService]++;
          console.log(`   ⚠️  "${oldService}" (no mapping, keeping as-is)`);
        }
      }
      
      // Build new service rates - copy from old where possible
      for (const oldRate of (provider.serviceRates || [])) {
        const newServices = SERVICE_MIGRATION_MAP[oldRate.serviceName];
        if (newServices && Array.isArray(newServices)) {
          // Add rate for each new service
          for (const newServiceName of newServices) {
            const existing = newServiceRates.find(r => r.serviceName === newServiceName);
            if (!existing) {
              newServiceRates.push({
                serviceName: newServiceName,
                price: oldRate.price
              });
            }
          }
        }
      }
      
      // Update provider
      provider.services = [...newServicesSet];
      provider.serviceRates = newServiceRates;
      await provider.save();
      
      console.log(`   📌 New services: [${provider.services.join(', ')}]`);
      updated++;
    }

    console.log('\n' + '='.repeat(70));
    console.log(`\n✅ Successfully migrated ${updated} providers to new services\n`);

    // Show summary
    console.log('📊 Service Distribution After Migration:\n');
    const sortedServices = Object.entries(migrationSummary)
      .sort((a, b) => b[1] - a[1]);
    
    for (const [service, count] of sortedServices) {
      console.log(`   ${service}: ${count} provider(s)`);
    }

    console.log(`\n📈 Total unique services providers are assigned to: ${sortedServices.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

migrateProviders();
