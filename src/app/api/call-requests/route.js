import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import CallRequest from '@/models/CallRequest';
import { validateInput, callRequestCreateSchema, callRequestUpdateSchema } from '@/lib/validation';

export async function POST(request) {
    try {
        await connectDB();
        const body = await request.json();

        const validation = validateInput(body, callRequestCreateSchema);
        if (!validation.success) {
            return NextResponse.json(
                { success: false, message: validation.message || 'Phone number is required', errors: validation.errors },
                { status: 400 }
            );
        }

        const callRequest = await CallRequest.create({
            phoneNumber: validation.data.phoneNumber
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

export async function PATCH(request) {
    try {
        await connectDB();
        const body = await request.json();

        const validation = validateInput(body, callRequestUpdateSchema);
        if (!validation.success) {
            return NextResponse.json(
                { success: false, message: validation.message || 'ID and Status are required', errors: validation.errors },
                { status: 400 }
            );
        }

        const updatedRequest = await CallRequest.findByIdAndUpdate(
            validation.data.id,
            { status: validation.data.status },
            { new: true }
        );

        return NextResponse.json({
            success: true,
            data: updatedRequest,
            message: 'Status updated successfully'
        });
    } catch (error) {
        console.error('Error updating call request:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update request' },
            { status: 500 }
        );
    }
}

