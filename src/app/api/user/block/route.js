import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Homeowner from '@/models/Homeowner';
import ServiceProvider from '@/models/ServiceProvider'; // Assuming bidirectional blocking might be needed later
import { cookies, headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

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

        const { blockedId, blockedModel = 'ServiceProvider' } = await request.json();

        if (!blockedId) {
            return NextResponse.json({ success: false, message: 'User ID to block is required' }, { status: 400 });
        }

        // Update Homeowner's blocked list
        await Homeowner.findByIdAndUpdate(userId, {
            $addToSet: {
                blockedUsers: {
                    userId: new mongoose.Types.ObjectId(blockedId),
                    userModel: blockedModel
                }
            }
        });

        console.log(`✅ User ${userId} blocked ${blockedId}`);

        return NextResponse.json({
            success: true,
            message: 'User blocked successfully. You will no longer see them.',
        });

    } catch (error) {
        console.error('Error blocking user:', error);
        return NextResponse.json({ success: false, message: 'Failed to block user' }, { status: 500 });
    }
}
