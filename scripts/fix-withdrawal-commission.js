const mongoose = require('mongoose');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://Sourabh:sourabhbisht@cluster0.2cog1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Transaction Schema (simplified)
const transactionSchema = new mongoose.Schema({}, { strict: false });
const Transaction = mongoose.model('Transaction', transactionSchema);

async function fixWithdrawals() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all pending withdrawal requests without commission fields
    const withdrawals = await Transaction.find({
      type: 'withdrawal_request',
      status: 'pending',
      $or: [
        { commissionAmount: { $exists: false } },
        { providerAmount: { $exists: false } },
        { commissionAmount: 0 },
        { commissionAmount: null }
      ]
    });

    console.log(`\n📊 Found ${withdrawals.length} withdrawals to fix`);

    for (const withdrawal of withdrawals) {
      const amount = withdrawal.amount || 0;
      const commissionRate = withdrawal.commissionPercentage || 15;
      
      const commissionAmount = Math.round(amount * (commissionRate / 100) * 100) / 100;
      const providerAmount = Math.round((amount - commissionAmount) * 100) / 100;

      console.log(`\n🔧 Fixing withdrawal ${withdrawal._id}:`);
      console.log(`   Amount: ₹${amount}`);
      console.log(`   Commission (${commissionRate}%): ₹${commissionAmount}`);
      console.log(`   Provider Amount: ₹${providerAmount}`);

      // Update the withdrawal
      await Transaction.updateOne(
        { _id: withdrawal._id },
        {
          $set: {
            commissionAmount,
            providerAmount,
            'withdrawalDetails.commissionAmount': commissionAmount,
            'withdrawalDetails.netAmount': providerAmount
          }
        }
      );

      console.log(`   ✅ Updated successfully`);
    }

    console.log(`\n✨ Fixed ${withdrawals.length} withdrawals`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

fixWithdrawals();
