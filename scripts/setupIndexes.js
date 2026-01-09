/**
 * Database Indexes Setup Script
 * 
 * Run this script to create performance indexes on MongoDB collections
 * This significantly improves query performance at scale
 * 
 * Usage: node scripts/setupIndexes.js
 */

import mongoose from 'mongoose';
import Booking from '../src/models/Booking.js';
import Transaction from '../src/models/Transaction.js';
import ServiceProvider from '../src/models/ServiceProvider.js';
import Homeowner from '../src/models/Homeowner.js';
import JobSession from '../src/models/JobSession.js';

async function setupIndexes() {
    try {
        console.log('🔧 Setting up database indexes...\n');

        // Booking indexes
        console.log('📦 Creating Booking indexes...');
        await Booking.collection.createIndex({ customerId: 1, status: 1, bookingDate: -1 });
        await Booking.collection.createIndex({ assignedProvider: 1, status: 1, bookingDate: -1 });
        await Booking.collection.createIndex({ status: 1, bookingDate: -1 });
        await Booking.collection.createIndex({ bookingDate: 1 });
        await Booking.collection.createIndex({ 'jobSession': 1 });
        console.log('✅ Booking indexes created\n');

        // Transaction indexes
        console.log('💰 Creating Transaction indexes...');
        await Transaction.collection.createIndex({ user: 1, createdAt: -1 });
        await Transaction.collection.createIndex({ userType: 1, status: 1 });
        await Transaction.collection.createIndex({ relatedBooking: 1 });
        await Transaction.collection.createIndex({ type: 1, status: 1, createdAt: -1 });
        console.log('✅ Transaction indexes created\n');

        // ServiceProvider indexes
        console.log('👷 Creating ServiceProvider indexes...');
        await ServiceProvider.collection.createIndex({ email: 1 }, { unique: true, sparse: true });
        await ServiceProvider.collection.createIndex({ phone: 1 }, { unique: true, sparse: true });
        await ServiceProvider.collection.createIndex({ services: 1, status: 1 });
        await ServiceProvider.collection.createIndex({ status: 1, rating: -1 });
        await ServiceProvider.collection.createIndex({ 'location.coordinates': '2dsphere' });
        console.log('✅ ServiceProvider indexes created\n');

        // Homeowner indexes
        console.log('🏠 Creating Homeowner indexes...');
        await Homeowner.collection.createIndex({ email: 1 }, { unique: true, sparse: true });
        await Homeowner.collection.createIndex({ phone: 1 }, { unique: true, sparse: true });
        console.log('✅ Homeowner indexes created\n');

        // JobSession indexes
        console.log('⏱️ Creating JobSession indexes...');
        await JobSession.collection.createIndex({ booking: 1 });
        await JobSession.collection.createIndex({ provider: 1, status: 1 });
        await JobSession.collection.createIndex({ customer: 1, status: 1 });
        await JobSession.collection.createIndex({ status: 1, startTime: -1 });
        console.log('✅ JobSession indexes created\n');

        console.log('🎉 All indexes created successfully!');
        console.log('\n📊 Index Summary:');
        console.log('- Booking: 5 indexes');
        console.log('- Transaction: 4 indexes');
        console.log('- ServiceProvider: 5 indexes');
        console.log('- Homeowner: 2 indexes');
        console.log('- JobSession: 4 indexes');
        console.log('\nTotal: 20 indexes created for optimal performance');

    } catch (error) {
        console.error('❌ Error creating indexes:', error);
        throw error;
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
        console.error('❌ MONGODB_URI environment variable is not set');
        process.exit(1);
    }

    mongoose.connect(MONGODB_URI)
        .then(() => {
            console.log('✅ Connected to MongoDB\n');
            return setupIndexes();
        })
        .then(() => {
            console.log('\n✅ Setup complete!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Setup failed:', error);
            process.exit(1);
        });
}

export default setupIndexes;
