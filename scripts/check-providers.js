// Check what services providers have registered for
// Usage: node scripts/check-providers.js

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

async function checkProviders() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected\n');

    const providers = await Provider.find({}).select('name services serviceRates status');
    
    console.log(`📋 Found ${providers.length} providers:\n`);
    console.log('='.repeat(60));
    
    const allServices = new Set();
    
    for (const p of providers) {
      console.log(`\n👤 ${p.name} (${p.status || 'unknown status'})`);
      console.log(`   Services: [${p.services?.join(', ') || 'NONE'}]`);
      
      if (p.serviceRates?.length > 0) {
        console.log(`   Rates:`);
        for (const rate of p.serviceRates) {
          console.log(`     - "${rate.serviceName}": ₹${rate.price}`);
        }
      }
      
      p.services?.forEach(s => allServices.add(s));
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 All unique service names registered by providers:\n');
    
    const sortedServices = [...allServices].sort();
    sortedServices.forEach((s, i) => {
      console.log(`   ${i + 1}. "${s}"`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('\n🎯 Services in your database (what app shows):');
    console.log('   Drivers, Pujari, Maids, Baby Sitters, Nurses, etc.');
    console.log('\n⚠️  If provider services don\'t match exactly, they won\'t show up!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected');
    process.exit(0);
  }
}

checkProviders();
