import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyDuWW76Kch_KG5n9vxNwSq3GfJCSSZuBOg';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const placeId = searchParams.get('placeId');

        if (!placeId) {
            return NextResponse.json({
                success: false,
                message: 'placeId is required'
            }, { status: 400 });
        }

        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_API_KEY}&fields=geometry,formatted_address,name`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK') {
            return NextResponse.json({
                success: true,
                result: data.result,
                data: data.result
            });
        }

        return NextResponse.json({
            success: false,
            message: data.status
        }, { status: 400 });

    } catch (error) {
        console.error('Place details error:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Failed to fetch place details'
        }, { status: 500 });
    }
}
