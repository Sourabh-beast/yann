const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' }); // Adjust path if needed

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://mhitesh059:Hitesh98@cluster0.p4pbe.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";

const cleanupServices = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Delete services with 'driver' category or old titles
        const Service = mongoose.connection.collection('services');

        // We want to delete the OLD ones. 
        // "Full-Day Personal Driver" and "Outstation Driving Service"
        const result = await Service.deleteMany({
            $or: [
                { title: 'Full-Day Personal Driver' },
                { title: 'Outstation Driving Service' },
                { category: 'driver' } // Delete all driver services to let the app re-sync the new one
            ]
        });

        console.log(`🗑️ Deleted ${result.deletedCount} driver services.`);

        console.log('✅ Cleanup complete. Restart the app to sync the new "Personal Driver" service.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        process.exit(1);
    }
};

cleanupServices();
