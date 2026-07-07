// Deletes the Homeowner/ServiceProvider DB record for given test phone numbers,
// so the number goes back to being "blank" - the next signup/registration
// starts completely fresh. The phone number itself keeps working for OTP-less
// login (that's defined in src/config/testUsers.js, not the DB), only the
// profile data it points to is removed.
//
// Usage:
//   node scripts/reset-test-users.js                  -> resets the 5 blank-slate numbers (7777777781-85)
//   node scripts/reset-test-users.js 7777777771        -> resets just this one number
//   node scripts/reset-test-users.js 7777777771 7777777776  -> resets multiple specific numbers

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

const Homeowner = mongoose.models.Homeowner || mongoose.model('Homeowner', homeownerSchema);
const ServiceProvider = mongoose.models.ServiceProvider || mongoose.model('ServiceProvider', providerSchema);

const DEFAULT_BLANK_SLATE_NUMBERS = [
  '7777777781',
  '7777777782',
  '7777777783',
  '7777777784',
  '7777777785',
];

function normalizePhone(input) {
  return input.replace(/\D/g, '').slice(-10);
}

async function reset() {
  const args = process.argv.slice(2).map(normalizePhone).filter(Boolean);
  const targets = args.length > 0 ? args : DEFAULT_BLANK_SLATE_NUMBERS;

  console.log('🔌 Connecting to MongoDB...');
  // Must match Server/src/lib/connectDB.js's dbName exactly, or this silently
  // operates on the wrong (default 'test') database.
  await mongoose.connect(MONGODB_URI, { dbName: 'YannDB' });
  console.log('✅ Connected to YannDB\n');

  console.log(`🧹 Resetting ${targets.length} number(s): ${targets.map((p) => `+91${p}`).join(', ')}\n`);

  for (const phone of targets) {
    const homeownerResult = await Homeowner.deleteOne({ phone });
    const providerResult = await ServiceProvider.deleteOne({ phone });

    const deleted = [];
    if (homeownerResult.deletedCount) deleted.push('homeowner');
    if (providerResult.deletedCount) deleted.push('provider');

    if (deleted.length > 0) {
      console.log(`   ✅ +91${phone} - removed ${deleted.join(' + ')} record`);
    } else {
      console.log(`   ⚪ +91${phone} - already blank, nothing to remove`);
    }
  }

  console.log('\n🎉 Done. These numbers can be used to sign up / register fresh again.');

  await mongoose.disconnect();
}

reset().catch((err) => {
  console.error('❌ Reset failed:', err);
  process.exit(1);
});
