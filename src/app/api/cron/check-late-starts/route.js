import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Booking from '@/models/Booking';
import ServiceProvider from '@/models/ServiceProvider';

/**
 * GET - Check for late starts and flag providers
 * This should be called by a cron job regularly (e.g., every 15-30 minutes)
 */
export async function GET(request) {
    try {
        await connectDB();

        const now = new Date();
        // 2 hours buffer in milliseconds
        const LATE_BUFFER_MS = 2 * 60 * 60 * 1000;

        // Find bookings that meet ALL criteria:
        // 1. Status is 'accepted' (meaning provider accepted but hasn't started)
        // 2. Scheduled start time was more than 2 hours ago
        // 3. Not yet started (startedAt is null)
        const lateBookings = await Booking.find({
            status: 'accepted',
            startedAt: null,
            bookingDate: { $lte: now } // Simple check first, refine in loop
        }).populate('assignedProvider');

        let flaggedCount = 0;
        const providerIdsToFlag = new Set();

        for (const booking of lateBookings) {
            if (!booking.bookingDate || !booking.bookingTime) continue;

            // Parse booking date and time
            const [hours, minutes] = booking.bookingTime.split(':').map(Number);
            const scheduledStart = new Date(booking.bookingDate);
            scheduledStart.setHours(hours, minutes, 0, 0);

            // Check if current time is past (scheduledTime + 2 hours)
            if (now.getTime() > (scheduledStart.getTime() + LATE_BUFFER_MS)) {
                if (booking.assignedProvider && !booking.assignedProvider.hasLateStarts) {
                    providerIdsToFlag.add(booking.assignedProvider._id);
                }
            }
        }

        // Bulk update providers
        if (providerIdsToFlag.size > 0) {
            const result = await ServiceProvider.updateMany(
                { _id: { $in: Array.from(providerIdsToFlag) } },
                { $set: { hasLateStarts: true } }
            );
            flaggedCount = result.modifiedCount;
        }

        console.log(`⏰ Late Start Check: Flagged ${flaggedCount} providers for late starts.`);

        return NextResponse.json({
            success: true,
            message: `Checked bookings. Flagged ${flaggedCount} providers.`,
            flaggedCount
        });

    } catch (error) {
        console.error('❌ Error checking late starts:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to check late starts', error: error.message },
            { status: 500 }
        );
    }
}
