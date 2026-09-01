// One-off dev utility: credits a test homeowner's wallet by a fixed amount
// and logs a matching Transaction record (type: 'wallet_credit'), same shape
// as the real topup flow in src/app/api/wallet/topup/verify/route.js.
//
// Usage: node scripts/credit-test-wallet.js <email-or-phone> <amount>
// Example: node scripts/credit-test-wallet.js member1@test.com 10000

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables (.env.local)');
  process.exit(1);
}

const [, , identifierArg, amountArg] = process.argv;
const identifier = identifierArg || 'member1@test.com';
const amount = Number(amountArg || 10000);

if (!Number.isFinite(amount) || amount <= 0) {
  console.error('❌ Amount must be a positive number');
  process.exit(1);
}

const homeownerSchema = new mongoose.Schema({}, { strict: false, collection: 'homeowners' });
const transactionSchema = new mongoose.Schema({}, { strict: false, collection: 'transactions' });

const Homeowner = mongoose.models.Homeowner || mongoose.model('Homeowner', homeownerSchema);
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

async function main() {
  await mongoose.connect(MONGODB_URI);

  const query = identifier.includes('@')
    ? { email: identifier.toLowerCase().trim() }
    : { phone: { $regex: identifier.replace(/\D/g, '').slice(-10) + '$' } };

  const user = await Homeowner.findOne(query);
  if (!user) {
    console.error(`❌ No homeowner found matching "${identifier}"`);
    process.exit(1);
  }

  const balanceBefore = user.wallet?.balance || 0;
  const balanceAfter = balanceBefore + amount;

  await Homeowner.updateOne(
    { _id: user._id },
    { $set: { 'wallet.balance': balanceAfter } }
  );

  await Transaction.create({
    customerId: user._id,
    type: 'wallet_credit',
    amount,
    balanceBefore,
    balanceAfter,
    description: 'Manual test credit (dev script)',
    status: 'completed',
    paymentMethod: 'test_credit',
    currency: 'INR',
  });

  console.log(`✅ Credited ₹${amount} to ${user.email} (${user.phone})`);
  console.log(`   Balance: ₹${balanceBefore} → ₹${balanceAfter}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
