import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyDuWW76Kch_KG5n9vxNwSq3GfJCSSZuBOg';

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
            // Calculate distance for each prediction if location provided
            const predictions = data.predictions || [];

            if (latitude && longitude) {
                // Fetch details for each prediction to get coordinates
                const predictionsWithDistance = await Promise.all(
                    predictions.slice(0, 5).map(async (prediction) => {
                        try {
                            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&key=${GOOGLE_MAPS_API_KEY}&fields=geometry`;
                            const detailsResponse = await fetch(detailsUrl);
                            const detailsData = await detailsResponse.json();

                            if (detailsData.status === 'OK') {
                                const placeLat = detailsData.result.geometry.location.lat;
                                const placeLng = detailsData.result.geometry.location.lng;
                                const distance = calculateDistance(
                                    parseFloat(latitude),
                                    parseFloat(longitude),
                                    placeLat,
                                    placeLng
                                );
                                return { ...prediction, distance };
                            }
                        } catch (error) {
                            console.error('Error fetching place details:', error);
                        }
                        return prediction;
                    })
                );

                // Sort by distance
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

// Haversine formula to calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
