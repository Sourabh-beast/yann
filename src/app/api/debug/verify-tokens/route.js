import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Homeowner from '@/models/Homeowner';
import ServiceProvider from '@/models/ServiceProvider';
import { Expo } from 'expo-server-sdk';

/**
 * GET /api/debug/verify-tokens
 * Debug endpoint to check push token storage in database
 */
export async function GET(request) {
    try {
        await connectDB();

        console.log('🔍 DEBUG: Verifying push tokens in database...');

        // Get all homeowners with push tokens
        const homeowners = await Homeowner.find({ pushToken: { $exists: true, $ne: null } })
            .select('name email phone pushToken')
            .lean();

        // Get all providers with push tokens
        const providers = await ServiceProvider.find({ pushToken: { $exists: true, $ne: null } })
            .select('name email phone pushToken')
            .lean();

        // Validate token formats
        const homeownersWithValidTokens = homeowners.filter(h =>
            h.pushToken && Expo.isExpoPushToken(h.pushToken)
        );

        const providersWithValidTokens = providers.filter(p =>
            p.pushToken && Expo.isExpoPushToken(p.pushToken)
        );

        const stats = {
            homeowners: {
                total: await Homeowner.countDocuments(),
                withTokens: homeowners.length,
                withValidTokens: homeownersWithValidTokens.length,
                withInvalidTokens: homeowners.length - homeownersWithValidTokens.length,
            },
            providers: {
                total: await ServiceProvider.countDocuments(),
                withTokens: providers.length,
                withValidTokens: providersWithValidTokens.length,
                withInvalidTokens: providers.length - providersWithValidTokens.length,
            }
        };

        console.log('📊 Token Statistics:', stats);

        // Return detailed information
        return NextResponse.json({
            success: true,
            message: 'Token verification complete',
            stats,
            homeowners: homeowners.map(h => ({
                id: h._id,
                name: h.name,
                email: h.email,
                phone: h.phone,
                hasToken: !!h.pushToken,
                tokenValid: h.pushToken ? Expo.isExpoPushToken(h.pushToken) : false,
                tokenPreview: h.pushToken ? h.pushToken.substring(0, 30) + '...' : null,
            })),
            providers: providers.map(p => ({
                id: p._id,
                name: p.name,
                email: p.email,
                phone: p.phone,
                hasToken: !!p.pushToken,
                tokenValid: p.pushToken ? Expo.isExpoPushToken(p.pushToken) : false,
                tokenPreview: p.pushToken ? p.pushToken.substring(0, 30) + '...' : null,
            })),
        });

    } catch (error) {
        console.error('❌ Error verifying tokens:', error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || 'Failed to verify tokens',
                error: error.stack
            },
            { status: 500 }
        );
    }
}
