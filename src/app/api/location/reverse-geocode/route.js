import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyDuWW76Kch_KG5n9vxNwSq3GfJCSSZuBOg';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const latitude = searchParams.get('latitude');
        const longitude = searchParams.get('longitude');

        if (!latitude || !longitude) {
            return NextResponse.json({
                success: false,
                message: 'latitude and longitude are required'
            }, { status: 400 });
        }

        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK' && data.results[0]) {
            return NextResponse.json({
                success: true,
                address: data.results[0].formatted_address,
                data: data.results[0].formatted_address
            });
        }

        return NextResponse.json({
            success: false,
            message: data.status,
            address: 'Unknown location',
            data: 'Unknown location'
        }, { status: 400 });

    } catch (error) {
        console.error('Reverse geocode error:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Failed to reverse geocode',
            address: 'Unknown location',
            data: 'Unknown location'
        }, { status: 500 });
    }
}
