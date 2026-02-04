import { NextResponse } from 'next/server';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const origin = searchParams.get('origin');
        const destination = searchParams.get('destination');

        if (!origin || !destination) {
            return NextResponse.json({
                success: false,
                message: 'origin and destination are required'
            }, { status: 400 });
        }

        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_MAPS_API_KEY}&mode=driving`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK') {
            return NextResponse.json({
                success: true,
                routes: data.routes,
                data: data.routes
            });
        }

        return NextResponse.json({
            success: false,
            message: data.status,
            data: []
        }, { status: 400 });

    } catch (error) {
        console.error('Directions error:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Failed to fetch directions',
            data: []
        }, { status: 500 });
    }
}
