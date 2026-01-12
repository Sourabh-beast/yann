/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    // Optional: Add trailing slash if preferred for GH pages, but usually not strictly required if not using custom server
    trailingSlash: true,
    images: {
        unoptimized: true, // Required for static export
    },
};

export default nextConfig;
