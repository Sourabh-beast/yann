import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const input = searchParams.get('input');
        const latitude = searchParams.get('latitude');
        const longitude = searchParams.get('longitude');

        if (!input || input.length < 2) {
            return NextResponse.json({
                success: false,
                message: 'Input must be at least 2 characters',
                predictions: []
            }, { status: 400 });
        }

        // Build Google Places Autocomplete URL
        let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_MAPS_API_KEY}&components=country:in`;

        // Add location bias if provided
        if (latitude && longitude) {
            url += `&location=${latitude},${longitude}&radius=50000`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK') {
            const predictions = data.predictions || [];

            if (latitude && longitude) {
                const limitedPredictions = predictions.slice(0, 5);
                const destinations = limitedPredictions
                    .map((prediction) => `place_id:${prediction.place_id}`)
                    .join('|');

                try {
                    const distanceUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${latitude},${longitude}&destinations=${encodeURIComponent(destinations)}&key=${GOOGLE_MAPS_API_KEY}`;
                    const distanceResponse = await fetch(distanceUrl);
                    const distanceData = await distanceResponse.json();

                    if (distanceData.status === 'OK' && distanceData.rows?.[0]?.elements) {
                        const elements = distanceData.rows[0].elements;
                        const predictionsWithDistance = limitedPredictions.map((prediction, index) => {
                            const element = elements[index];
                            if (element?.status === 'OK' && element.distance?.value != null) {
                                const distanceKm = element.distance.value / 1000;
                                return { ...prediction, distance: distanceKm };
                            }
                            return prediction;
                        });

                        predictionsWithDistance.sort((a, b) => {
                            if (a.distance && b.distance) return a.distance - b.distance;
                            if (a.distance) return -1;
                            if (b.distance) return 1;
                            return 0;
                        });

                        return NextResponse.json({
                            success: true,
                            predictions: predictionsWithDistance,
                            data: predictionsWithDistance
                        });
                    }
                } catch (error) {
                    console.error('Distance matrix error:', error);
                }

                return NextResponse.json({
                    success: true,
                    predictions: limitedPredictions,
                    data: limitedPredictions
                });
            }

            return NextResponse.json({
                success: true,
                predictions,
                data: predictions
            });
        }

        return NextResponse.json({
            success: false,
            message: data.status,
            predictions: []
        }, { status: 400 });

    } catch (error) {
        console.error('Autocomplete error:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Failed to fetch suggestions',
            predictions: []
        }, { status: 500 });
    }
}

