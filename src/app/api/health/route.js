import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import mongoose from 'mongoose';
import { getRedisClient, isRedisAvailable } from '@/lib/redisRateLimiter';

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

        // Redis status is informational only - it does not affect overall
        // status/HTTP code below, since Redis config in production is not yet
        // confirmed reliable and this endpoint's existing consumers (uptime
        // monitoring, mobile connectivity check) shouldn't start seeing 503s
        // for a pre-existing condition. Promote this once Redis is confirmed
        // required in production.
        const redisClient = getRedisClient();
        health.checks.redis = {
            status: !redisClient ? 'not_configured' : (isRedisAvailable() ? 'healthy' : 'unhealthy'),
        };

        health.checks.memory = {
            rssMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
            heapUsedMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        };

        // Overall health status - only database/environment gate this today
        // (see redis note above)
        const allHealthy = ['database', 'environment'].every(key => health.checks[key].status === 'healthy');
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
