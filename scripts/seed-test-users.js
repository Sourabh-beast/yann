// Seeds 10 test users (5 homeowners, 5 providers) with phone numbers
// +91 7777777771 .. +91 7777777780, fully set up for free-form testing:
// - homeowners: aadhaarVerified + wallet balance pre-loaded so wallet bookings work immediately
// - providers: active/approved/online with real service names + rates from the live catalog
//
// These numbers are also registered in src/config/testUsers.js so they can log in
// with a fixed OTP (no real SMS) whenever the app is running in dev/test mode.
//
// Usage: node scripts/seed-test-users.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

const homeownerSchema = new mongoose.Schema({}, { strict: false, collection: 'homeowners' });
const providerSchema = new mongoose.Schema({}, { strict: false, collection: 'serviceproviders' });
const serviceSchema = new mongoose.Schema({}, { strict: false, collection: 'services' });

const Homeowner = mongoose.models.Homeowner || mongoose.model('Homeowner', homeownerSchema);
const ServiceProvider = mongoose.models.ServiceProvider || mongoose.model('ServiceProvider', providerSchema);
const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema);

const PHONE_PREFIX = '77777777'; // + 71..80 => 10-digit numbers 7777777771..7777777780
const HOMEOWNER_SUFFIXES = ['71', '72', '73', '74', '75'];
const PROVIDER_SUFFIXES = ['76', '77', '78', '79', '80'];

const FALLBACK_SERVICES = [
  ['House Cleaning', 'Regular House Cleaning'],
  ['AC Service Technicians', 'Electricians'],
  ['Maids', 'Cooks'],
  ['Security Guards', 'Baby Sitters'],
  ['Plumbers', 'Pest Control'],
];

async function pickServiceSets() {
  // Pull real, currently-live non-driver service titles so seeded providers
  // are actually bookable through the normal browse/search flows.
  const liveServices = await Service.find({
    isActive: { $ne: false },
    category: { $ne: 'driver' },
  }).select('title category').lean();

  if (!liveServices || liveServices.length < 2) {
    console.warn('⚠️  Fewer than 2 live services found in DB, using fallback service names');
    return FALLBACK_SERVICES;
  }

  const titles = liveServices.map((s) => s.title);
  const sets = [];
  for (let i = 0; i < 5; i++) {
    const a = titles[(i * 2) % titles.length];
    const b = titles[(i * 2 + 1) % titles.length];
    sets.push(a === b ? [a] : [a, b]);
  }
  return sets;
}

async function seed() {
  console.log('🔌 Connecting to MongoDB...');
  // IMPORTANT: the app (Server/src/lib/connectDB.js) always connects with
  // dbName: 'YannDB' explicitly. Without it here, mongoose silently falls
  // back to the default 'test' database - a completely different, invisible
  // database that the app never reads from.
  await mongoose.connect(MONGODB_URI, { dbName: 'YannDB' });
  console.log('✅ Connected to YannDB\n');

  // Clean up incorrect 9-digit records from a prior buggy run (wrong prefix length)
  const badPrefix = '7777777';
  const badHomeowners = await Homeowner.deleteMany({ phone: { $in: HOMEOWNER_SUFFIXES.map((s) => `${badPrefix}${s}`) } });
  const badProviders = await ServiceProvider.deleteMany({ phone: { $in: PROVIDER_SUFFIXES.map((s) => `${badPrefix}${s}`) } });
  if (badHomeowners.deletedCount || badProviders.deletedCount) {
    console.log(`🧹 Removed ${badHomeowners.deletedCount} bad homeowner + ${badProviders.deletedCount} bad provider record(s) from prior run\n`);
  }

  const serviceSets = await pickServiceSets();

  console.log('👤 Seeding 5 homeowners...');
  for (let i = 0; i < 5; i++) {
    const phone = `${PHONE_PREFIX}${HOMEOWNER_SUFFIXES[i]}`;
    const name = `Test Homeowner ${i + 1}`;
    await Homeowner.findOneAndUpdate(
      { phone },
      {
        $setOnInsert: {
          name,
          email: `testhomeowner${i + 1}@yanntest.com`,
          phone,
          preferences: [],
          addressBook: [],
          // Only set the starting balance on first creation - re-running this
          // script must never wipe out real balance from actual testing activity
          'wallet.balance': 5000,
          'wallet.currency': 'INR',
        },
        $set: {
          isVerified: true,
          aadhaarVerified: true,
          aadhaarVerifiedAt: new Date(),
          isBlocked: false,
        },
      },
      { upsert: true, new: true }
    );
    console.log(`   ✅ +91${phone} - ${name} (wallet: ₹5000, Aadhaar verified)`);
  }

  console.log('\n🔧 Seeding 5 service providers...');
  for (let i = 0; i < 5; i++) {
    const phone = `${PHONE_PREFIX}${PROVIDER_SUFFIXES[i]}`;
    const name = `Test Provider ${i + 1}`;
    const services = serviceSets[i];
    const serviceRates = services.map((serviceName) => ({
      serviceName,
      price: 500 + i * 100,
      billingType: 'fixed',
    }));

    await ServiceProvider.findOneAndUpdate(
      { phone },
      {
        $setOnInsert: {
          name,
          email: `testprovider${i + 1}@yanntest.com`,
          phone,
          experience: 5,
          bio: 'Seeded test provider account',
          workingHours: { startTime: '09:00', endTime: '18:00' },
          'wallet.balance': 0,
          'wallet.currency': 'INR',
        },
        $set: {
          services,
          serviceRates,
          selectedCategories: [],
          status: 'active',
          isOnline: true,
          isVerified: true,
          adminApproved: true,
          adminApprovedAt: new Date(),
          aadhaarVerified: true,
          aadhaarVerifiedAt: new Date(),
          isBlocked: false,
        },
      },
      { upsert: true, new: true }
    );
    console.log(`   ✅ +91${phone} - ${name} - [${services.join(', ')}] (active, approved, online)`);
  }

  console.log('\n🎉 Done. All 10 test users are active in the database.');
  console.log('   Log in via OTP screen using the numbers above with OTP 1234');
  console.log('   (requires src/config/testUsers.js entries + dev/test mode - see that file).');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
