
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const { Expo } = require('expo-server-sdk');

// Define minimal schemas for query
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    pushToken: String,
    updatedAt: Date
});

const Homeowner = mongoose.models.Homeowner || mongoose.model('Homeowner', userSchema);
const ServiceProvider = mongoose.models.ServiceProvider || mongoose.model('ServiceProvider', userSchema);

const connectDB = async () => {
    if (mongoose.connections[0].readyState) return;
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
};

const sendTestNotification = async () => {
    try {
        await connectDB();
        const expo = new Expo();

        console.log('🔍 Searching for users with push tokens...');

        const homeowner = await Homeowner.findOne({ pushToken: { $exists: true, $ne: null } }).sort({ updatedAt: -1 });
        const provider = await ServiceProvider.findOne({ pushToken: { $exists: true, $ne: null } }).sort({ updatedAt: -1 });

        // Pick the most recently updated one
        let targetUser = null;
        let type = '';

        if (homeowner && provider) {
            if (new Date(homeowner.updatedAt) > new Date(provider.updatedAt)) {
                targetUser = homeowner;
                type = 'Homeowner';
            } else {
                targetUser = provider;
                type = 'Provider';
            }
        } else if (homeowner) {
            targetUser = homeowner;
            type = 'Homeowner';
        } else if (provider) {
            targetUser = provider;
            type = 'Provider';
        }

        if (!targetUser) {
            console.error('❌ No users with push tokens found!');
            process.exit(1);
        }

        console.log(`🎯 Found target: ${targetUser.name} (${type})`);
        console.log(`📱 Token: ${targetUser.pushToken}`);

        if (!Expo.isExpoPushToken(targetUser.pushToken)) {
            console.error('❌ Token is not a valid Expo push token');
            process.exit(1);
        }

        const messages = [{
            to: targetUser.pushToken,
            sound: 'default',
            title: '🚀 Yann App Notification Test',
            body: `Hello ${targetUser.name}! Note setup is working correctly. sent at ${new Date().toLocaleTimeString()}`,
            data: { test: true },
        }];

        console.log('📤 Sending notification...');
        const chunks = expo.chunkPushNotifications(messages);

        for (let chunk of chunks) {
            try {
                const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                console.log('✅ Result:', ticketChunk);
            } catch (error) {
                console.error('❌ Error sending chunk:', error);
            }
        }

    } catch (error) {
        console.error('❌ Script error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

sendTestNotification();
