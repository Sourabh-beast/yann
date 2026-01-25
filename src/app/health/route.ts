import { NextResponse } from 'next/server';

/**
 * GET /health
 * Health check endpoint for backend availability detection
 * Used by mobile app to detect if local backend is running
 */
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
}
