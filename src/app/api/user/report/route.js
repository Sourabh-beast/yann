import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Report from '@/models/Report';
import { cookies, headers } from 'next/headers';
import jwt from 'jsonwebtoken';

// Helper to get authenticated user (reused)
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

export async function POST(request) {
    try {
        await connectDB();
        const { userId } = await getAuthenticatedUser();

        if (!userId) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { reportedId, reason, description, bookingId, reporterModel = 'Homeowner', reportedModel = 'ServiceProvider' } = await request.json();

        if (!reportedId || !reason) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        const report = new Report({
            reporterId: userId,
            reporterModel,
            reportedId,
            reportedModel,
            reason,
            description,
            bookingId
        });

        await report.save();

        console.log(`✅ User ${userId} reported ${reportedId} for ${reason}`);

        return NextResponse.json({
            success: true,
            message: 'Report submitted successfully. We will review this shortly.',
            data: report
        });

    } catch (error) {
        console.error('Error submitting report:', error);
        return NextResponse.json({ success: false, message: 'Failed to submit report' }, { status: 500 });
    }
}
