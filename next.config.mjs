/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
    // output: 'export', // Reverted: API routes require dynamic server/serverless (not static export)
    // trailingSlash: true, // Optional
    images: {
        // unoptimized: true, // Only needed for static export
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                pathname: '/**',
            },
        ],
        // Serve modern formats for smaller sizes
        formats: ['image/avif', 'image/webp'],
        // Limit device sizes to reduce origin image generation
        deviceSizes: [640, 750, 828, 1080, 1200],
        imageSizes: [16, 32, 48, 64, 96, 128, 256],
        // Cache optimized images for longer (default 60s is too low)
        minimumCacheTTL: 2592000, // 30 days in seconds
    },
    eslint: {
        ignoreDuringBuilds: true, // Ignore ESLint errors during build
    },
    typescript: {
        ignoreBuildErrors: true, // Ignore TypeScript errors during build (for now)
    },
    // Enable gzip/brotli compression to reduce transfer size
    compress: true,
    // Avoid incorrect workspace-root inference (monorepo with multiple lockfiles)
    outputFileTracingRoot: __dirname,
    turbopack: {
        root: __dirname,
    },
    // Set aggressive caching headers for static assets
    async headers() {
        return [
            {
                // Cache static assets (JS, CSS, images) for 1 year
                source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif|js|css|woff|woff2)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                // Cache Next.js static chunks for 1 year
                source: '/_next/static/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                // Cache optimized images for 30 days
                source: '/_next/image/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=2592000, stale-while-revalidate=86400',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
