// Migrate providers from old service names to new service names
// Usage: node scripts/migrate-provider-services.js

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

// Mapping from OLD service names to NEW service names
const SERVICE_NAME_MAP = {
  // Driver services -> "Drivers"
  'Full-Day Personal Driver': 'Drivers',
  'Outstation Driving Service': 'Drivers',
  'Driver': 'Drivers',
  'Personal Driver': 'Drivers',
  
  // Pujari services -> "Pujari"
  'Pujari Services': 'Pujari',
  'Satyanarayan Katha': 'Pujari',
  'Rudrabhishek Puja': 'Pujari',
  'Havan Ceremony': 'Pujari',
  'Wedding Rituals': 'Pujari',
  'Griha Pravesh': 'Pujari',
  
  // Cleaning services
  'House Cleaning': 'Maids',
  'Deep House Cleaning': 'Cleaners',
  'Deep Cleaning': 'Cleaners',
  'Bathroom Cleaning': 'Toilet Cleaning Experts',
  
  // Other services
  'Laundry Service': 'Maids',
  'Ironing Service': 'Maids',
};

async function migrateProviders() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected\n');

    const providers = await Provider.find({});
    console.log(`📋 Found ${providers.length} providers to migrate\n`);
    console.log('='.repeat(60));

    let updated = 0;

    for (const provider of providers) {
      console.log(`\n👤 ${provider.name}:`);
      console.log(`   Old services: [${provider.services?.join(', ') || 'NONE'}]`);
      
      // Map old services to new services
      const newServices = new Set();
      const newServiceRates = [];
      
      for (const oldService of (provider.services || [])) {
        const newService = SERVICE_NAME_MAP[oldService];
        if (newService) {
          newServices.add(newService);
          console.log(`   ✅ "${oldService}" → "${newService}"`);
        } else {
          // Keep as-is if no mapping (might already be correct)
          newServices.add(oldService);
          console.log(`   ⚠️  "${oldService}" (no mapping, keeping as-is)`);
        }
      }
      
      // Map service rates
      for (const rate of (provider.serviceRates || [])) {
        const newServiceName = SERVICE_NAME_MAP[rate.serviceName] || rate.serviceName;
        
        // Check if we already have a rate for this new service
        const existing = newServiceRates.find(r => r.serviceName === newServiceName);
        if (!existing) {
          newServiceRates.push({
            serviceName: newServiceName,
            price: rate.price
          });
        }
      }
      
      // Update provider
      provider.services = [...newServices];
      provider.serviceRates = newServiceRates;
      await provider.save();
      
      console.log(`   New services: [${provider.services.join(', ')}]`);
      updated++;
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n✅ Migrated ${updated} providers to new service names`);

    // Show summary
    console.log('\n📊 New service distribution:');
    const serviceCounts = {};
    const allProviders = await Provider.find({ status: 'active' });
    for (const p of allProviders) {
      for (const s of (p.services || [])) {
        serviceCounts[s] = (serviceCounts[s] || 0) + 1;
      }
    }
    
    for (const [service, count] of Object.entries(serviceCounts).sort()) {
      console.log(`   ${service}: ${count} active provider(s)`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected');
    process.exit(0);
  }
}

migrateProviders();
