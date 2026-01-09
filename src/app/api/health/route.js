import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import mongoose from 'mongoose';

/**
 * GET /api/health
 * Health check endpoint for monitoring and load balancers
 */
export async function GET(request) {
    const startTime = Date.now();

    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        checks: {}
    };

    try {
        // Check database connection
        await connectDB();
        const dbState = mongoose.connection.readyState;

        health.checks.database = {
            status: dbState === 1 ? 'healthy' : 'unhealthy',
            state: dbState,
            responseTime: Date.now() - startTime
        };

        // Check environment variables
        const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI'];
        const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);

        health.checks.environment = {
            status: missingEnvVars.length === 0 ? 'healthy' : 'unhealthy',
            missing: missingEnvVars
        };

        // Overall health status
        const allHealthy = Object.values(health.checks).every(check => check.status === 'healthy');
        health.status = allHealthy ? 'healthy' : 'degraded';

        const statusCode = allHealthy ? 200 : 503;

        return NextResponse.json(health, { status: statusCode });
    } catch (error) {
        health.status = 'unhealthy';
        health.checks.database = {
            status: 'unhealthy',
            error: error.message
        };

        return NextResponse.json(health, { status: 503 });
    }
}
