import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import CallRequest from '@/models/CallRequest';

export async function POST(request) {
    try {
        await connectDB();
        const { phoneNumber } = await request.json();

        if (!phoneNumber) {
            return NextResponse.json(
                { success: false, message: 'Phone number is required' },
                { status: 400 }
            );
        }

        const callRequest = await CallRequest.create({
            phoneNumber
        });

        return NextResponse.json({
            success: true,
            message: 'Call request received successfully',
            data: callRequest
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating call request:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create call request' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        await connectDB();
        // Assuming this might be used by admin panel to list requests
        const requests = await CallRequest.find({}).sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            data: requests
        });
    } catch (error) {
        console.error('Error fetching call requests:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch call requests' },
            { status: 500 }
        );
    }
}
