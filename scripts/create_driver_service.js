const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env.local');
    process.exit(1);
}

// Define Schema locally to avoid ESM import issues
const ServiceSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, lowercase: true },
    price: { type: String, required: true },
    features: [{ type: String, trim: true }],
    icon: { type: String, default: '🏠' },
    popular: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    experiencePriceLimits: [{
        minYears: { type: Number, required: true, min: 0 },
        maxYears: { type: Number, default: null },
        maxPrice: { type: Number, required: true, min: 0 }
    }],
}, { timestamps: true });

const Service = mongoose.models.Service || mongoose.model('Service', ServiceSchema);

const createDriverService = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { dbName: "YannDB" });
        console.log('✅ Connected to MongoDB');

        const serviceData = {
            title: 'Driver',
            description: 'Professional driver service for your vehicle',
            category: 'driver',
            price: 'Varies',
            icon: 'car-outline',
            popular: true,
            features: ['In-city driving', 'Outstation trips', 'Manual & Automatic', 'Verified drivers'],
            experiencePriceLimits: [
                { minYears: 0, maxYears: 5, maxPrice: 1500 },
                { minYears: 5, maxYears: 10, maxPrice: 2000 },
                { minYears: 10, maxYears: null, maxPrice: 2500 }
            ]
        };

        const existing = await Service.findOne({ title: serviceData.title, category: serviceData.category });

        if (existing) {
            console.log('ℹ️ Service "Driver" already exists. Updating...');
            Object.assign(existing, serviceData);
            await existing.save();
            console.log('✅ Service "Driver" updated successfully');
        } else {
            await Service.create(serviceData);
            console.log('✅ Service "Driver" created successfully');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected');
        process.exit(0);
    }
};

createDriverService();
