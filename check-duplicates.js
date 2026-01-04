
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });
if (!process.env.MONGODB_URI) {
    require('dotenv').config({ path: path.join(__dirname, '.env') });
}

const connectDB = async () => {
    if (mongoose.connections[0].readyState) return;
    await mongoose.connect(process.env.MONGODB_URI);
};

const checkDuplicates = async () => {
    try {
        await connectDB();
        console.log('✅ Connected to MongoDB');

        // Define minimal schema to query
        const providerSchema = new mongoose.Schema({}, { strict: false });
        const ServiceProvider = mongoose.models.ServiceProvider || mongoose.model('ServiceProvider', providerSchema);

        const email = 'provider1@test.com'; // The email from your logs
        console.log(`🔎 Checking for duplicates for: ${email}`);

        const users = await ServiceProvider.find({ email: email });

        console.log(`📊 Found ${users.length} user(s) with this email.`);

        users.forEach((u, i) => {
            console.log(`\n👤 User #${i + 1}:`);
            console.log(`   ID: ${u._id}`);
            console.log(`   Name: ${u.name}`);
            console.log(`   Has Avatar field: ${!!u.avatar}`);
            console.log(`   Has ProfileImage field: ${!!u.profileImage}`);
            console.log(`   Data length: Avatar=${u.avatar?.length || 0}, ProfileImage=${u.profileImage?.length || 0}`);
        });

        if (users.length > 1) {
            console.log('\n⚠️ DUPLICATE DETECTED! This explains why checking by ID vs Email gives different results.');
        } else {
            console.log('\n✅ No duplicates found. The issue is likely elsewhere.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

checkDuplicates();
