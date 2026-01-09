import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import ServiceProvider from '@/models/ServiceProvider';
import { getPaginationParams, createPaginationMeta } from '@/lib/pagination';

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

        // Build search query
        const searchQuery: any = { status: 'active' };

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

        // Get total count
        const total = await ServiceProvider.countDocuments(searchQuery);

        // Build sort object
        const sortObj: any = {};
        if (sortBy === 'price') {
            sortObj['serviceRates.0.price'] = sortOrder;
        } else if (sortBy === 'rating') {
            sortObj.rating = sortOrder;
        } else {
            sortObj.createdAt = -1;
        }

        // Execute search
        const providers = await ServiceProvider.find(searchQuery)
            .select('name email phone services serviceRates rating totalReviews profileImage bio status')
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
        });
    } catch (error) {
        console.error('Provider search error:', error);
        return NextResponse.json(
            { success: false, message: 'Search failed', data: [] },
            { status: 500 }
        );
    }
}
