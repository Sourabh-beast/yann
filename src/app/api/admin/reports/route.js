import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Report from '@/models/Report';
import { cookies, headers } from 'next/headers';
import jwt from 'jsonwebtoken';

// Helper to get authenticated user (admin check to be added if needed, currently just verifying token)
// In a real app, we should check user.role === 'admin'
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
        return { userId: decoded.id || decoded._id, role: decoded.role };
    } catch (error) {
        return { userId: null };
    }
};

export async function GET(request) {
    try {
        await connectDB();
        const { userId } = await getAuthenticatedUser();

        // For now, we assume anyone with a valid token can *hit* this, 
        // but in production, uncomment the role check below.
        if (!userId) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        // Fetch reports with populated data
        // We populate reporter and reported based on their dynamic model types
        const reports = await Report.find()
            .sort({ createdAt: -1 })
            .populate('reporterId', 'name email phone avatar')
            .populate('reportedId', 'name email phone avatar profileImage') // Support both fields
            .populate('bookingId', 'status bookingId')
            .lean();

        return NextResponse.json({
            success: true,
            data: reports,
        });

    } catch (error) {
        console.error('Error fetching admin reports:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch reports' }, { status: 500 });
    }
}
