import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import ServiceProvider from '@/models/ServiceProvider';
import Homeowner from '@/models/Homeowner';
import { getPaginationParams, createPaginationMeta } from '@/lib/pagination';
import { cookies, headers } from 'next/headers';
import jwt from 'jsonwebtoken';

const getAuthenticatedUser = async () => {
    const cookieStore = await cookies();
    let token = cookieStore.get('yann_session')?.value || cookieStore.get('yann_home_session')?.value;

    if (!token) {
        const headersList = await headers();
        const authHeader = headersList.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }

    if (!token) return { userId: null };

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return { userId: decoded.id || decoded._id };
    } catch (error) {
        return { userId: null };
    }
};

/**
 * GET /api/providers/search
 * Search providers with filters
 */
export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';
        const service = searchParams.get('service');
        const minRating = parseFloat(searchParams.get('minRating') || '0');
        const sortBy = searchParams.get('sortBy') || 'rating';
        const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

        // Get pagination params
        const { page, limit, skip } = getPaginationParams(request);

        // Get available blocked users if logged in
        const { userId } = await getAuthenticatedUser();
        let blockedProviderIds = [];

        if (userId) {
            const user = await Homeowner.findById(userId).select('blockedUsers');
            if (user?.blockedUsers?.length) {
                blockedProviderIds = user.blockedUsers.map(b => b.userId);
            }
        }

        // Build search query
        const searchQuery = { status: 'active' };

        // Exclude blocked providers
        if (blockedProviderIds.length > 0) {
            searchQuery._id = { $nin: blockedProviderIds };
        }

        // Text search on name and services
        if (query) {
            searchQuery.$or = [
                { name: { $regex: query, $options: 'i' } },
                { services: { $regex: query, $options: 'i' } },
                { bio: { $regex: query, $options: 'i' } },
            ];
        }

        // Filter by service
        if (service) {
            searchQuery.services = service;
        }

        // Filter by rating
        if (minRating > 0) {
            searchQuery.rating = { $gte: minRating };
        }

        // Driver Filters
        const vehicleType = searchParams.get('vehicleType');
        const transmission = searchParams.get('transmission');
        const tripType = searchParams.get('tripType');

        if (vehicleType) {
            searchQuery['driverServiceDetails.vehicleTypes'] = vehicleType;
        }
        if (transmission) {
            searchQuery['driverServiceDetails.transmissionTypes'] = transmission;
        }
        if (tripType) {
            // If user wants 'incity', provider can be 'incity' or 'both'
            // If user wants 'outstation', provider can be 'outstation' or 'both'
            searchQuery['driverServiceDetails.tripPreference'] = { $in: [tripType, 'both'] };
        }

        // Get total count
        const total = await ServiceProvider.countDocuments(searchQuery);

        // Build sort object
        const sortObj = {};
        if (sortBy === 'price') {
            sortObj['serviceRates.0.price'] = sortOrder;
        } else if (sortBy === 'rating') {
            sortObj.rating = sortOrder;
        } else {
            sortObj.createdAt = -1;
        }

        // Execute search
        const providers = await ServiceProvider.find(searchQuery)
            .select('name email phone services serviceRates rating totalReviews profileImage bio status isOnline')
            .sort(sortObj)
            .skip(skip)
            .limit(limit)
            .lean();

        return NextResponse.json({
            success: true,
            data: providers,
            meta: {
                ...createPaginationMeta(total, page, limit),
                query,
                filters: { service, minRating, sortBy, sortOrder: sortOrder === 1 ? 'asc' : 'desc' },
            },
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
                'CDN-Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
            }
        });
    } catch (error) {
        console.error('Provider search error:', error);
        return NextResponse.json(
            { success: false, message: 'Search failed', data: [] },
            { status: 500 }
        );
    }
}
