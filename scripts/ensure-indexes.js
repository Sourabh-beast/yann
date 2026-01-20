const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' }); // Adjust for your path if needed

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/yann-care';

async function createIndexes() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected.');

        const db = mongoose.connection.db;

        // 1. Service Provider Indexes (for service counts aggregation)
        console.log('🏗️ Indexing ServiceProviders...');
        const providers = db.collection('serviceproviders');
        await providers.createIndex({ status: 1, 'services.name': 1 }); // Covering index for aggregation match & unwind
        await providers.createIndex({ 'services.name': 1 }); // Single field index

        // 2. Service Indexes (for fetching active services)
        console.log('🏗️ Indexing Services...');
        const services = db.collection('services');
        await services.createIndex({ isActive: 1, category: 1 });
        await services.createIndex({ popular: -1 });

        // 3. Booking Indexes (for fetching my bookings)
        console.log('🏗️ Indexing Bookings...');
        const bookings = db.collection('bookings');
        await bookings.createIndex({ customerId: 1, createdAt: -1 }); // Critical for "My Bookings" list
        await bookings.createIndex({ providerId: 1, status: 1 }); // Critical for provider dashboard

        console.log('✨ All indexes created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating indexes:', error);
        process.exit(1);
    }
}

createIndexes();
