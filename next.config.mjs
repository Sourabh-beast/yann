/** @type {import('next').NextConfig} */
const nextConfig = {
    // output: 'export', // Reverted: API routes require dynamic server/serverless (not static export)
    // trailingSlash: true, // Optional
    images: {
        // unoptimized: true, // Only needed for static export
        domains: ['res.cloudinary.com'], // Add common image domains if needed
    },
};

export default nextConfig;
