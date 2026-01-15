/**
 * Script to update minimum withdrawal amount from 100 to 1
 * Run with: node scripts/update-withdrawal-minimum.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

async function updateWithdrawalMinimum() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const PlatformSettings = mongoose.connection.collection('platformsettings');

    // Check if settings exist
    const existing = await PlatformSettings.findOne({ key: 'platform_settings' });
    
    if (!existing) {
      console.log('📝 No platform settings found, creating default...');
      await PlatformSettings.insertOne({
        key: 'platform_settings',
        walletPayment: {
          minWithdrawalAmount: 1,
          maxWithdrawalAmount: 100000,
          partnerWithdrawalCommission: 15,
          autoApproveWithdrawalLimit: 1000,
          withdrawalProcessingDays: 3
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Created platform settings with minimum withdrawal of ₹1');
    } else {
      // Update the minWithdrawalAmount to 1
      const result = await PlatformSettings.updateOne(
        { key: 'platform_settings' },
        {
          $set: {
            'walletPayment.minWithdrawalAmount': 1,
            'updatedAt': new Date()
          }
        }
      );

      console.log(`✅ Updated ${result.modifiedCount} document(s)`);
      console.log('✅ Minimum withdrawal amount changed from ₹100 to ₹1');
    }

    // Verify the update
    const settings = await PlatformSettings.findOne({ key: 'platform_settings' });
    if (settings) {
      console.log('\n📊 Current settings:');
      console.log(`   minWithdrawalAmount: ₹${settings.walletPayment?.minWithdrawalAmount || 'not set'}`);
      console.log(`   maxWithdrawalAmount: ₹${settings.walletPayment?.maxWithdrawalAmount || 'not set'}`);
      console.log(`   partnerWithdrawalCommission: ${settings.walletPayment?.partnerWithdrawalCommission || 'not set'}%`);
    }

    await mongoose.disconnect();
    console.log('\n✅ Done! Restart your backend server and refresh the app.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error updating withdrawal minimum:', error);
    process.exit(1);
  }
}

updateWithdrawalMinimum();
