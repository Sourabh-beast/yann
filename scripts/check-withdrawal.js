const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://Sourabh:sourabhbisht@cluster0.2cog1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const transactionSchema = new mongoose.Schema({}, { strict: false });
const Transaction = mongoose.model('Transaction', transactionSchema);

async function checkWithdrawal() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check all transactions
    const allCount = await Transaction.countDocuments({});
    console.log(`\n📊 Total transactions in database: ${allCount}`);

    const withdrawals = await Transaction.find({
      type: 'withdrawal_request'
    }).sort({ createdAt: -1 }).limit(10);

    console.log(`\n📊 Found ${withdrawals.length} withdrawal_request transactions\n`);

    for (const w of withdrawals) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`ID: ${w._id}`);
      console.log(`Amount: ${w.amount}`);
      console.log(`Commission Amount: ${w.commissionAmount}`);
      console.log(`Commission Percentage: ${w.commissionPercentage}`);
      console.log(`Provider Amount: ${w.providerAmount}`);
      console.log(`Withdrawal Details:`, JSON.stringify(w.withdrawalDetails, null, 2));
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

checkWithdrawal();
