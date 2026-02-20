import { NextResponse } from 'next/server';

// CORS configuration for mobile apps
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:8081',
  'http://localhost:19000',
  'http://localhost:19006',
  'https://yann-care.vercel.app',
  'exp://localhost:8081',
  'exp://localhost:19000',
];

// Helper to check if origin is allowed
function isAllowedOrigin(origin) {
  if (!origin) return true; // Allow requests with no origin (like mobile apps)
  return ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed) || origin.includes('localhost'));
}

// Public GET API routes that can be cached at the CDN edge
// Format: { path: string | regex, maxAge: number (seconds), staleWhileRevalidate: number }
const CACHEABLE_GET_ROUTES = [
  { path: '/api/services', maxAge: 1800, swr: 3600 },          // 30 min cache, 1 hr stale
  { path: '/api/providers', maxAge: 60, swr: 300 },            // 1 min cache, 5 min stale
  { path: '/api/providers/search', maxAge: 30, swr: 120 },     // 30 sec cache, 2 min stale
  { path: '/api/health', maxAge: 0, swr: 0 },                  // never cache
];

// Admin GET routes - shorter cache, private
const CACHEABLE_ADMIN_ROUTES = [
  { path: '/api/admin/stats', maxAge: 300, swr: 600 },         // 5 min cache
  { path: '/api/admin/services', maxAge: 600, swr: 1200 },     // 10 min cache
  { path: '/api/admin/providers', maxAge: 60, swr: 300 },      // 1 min cache
];

function getCacheHeaders(pathname, isGet) {
  if (!isGet) return null;

  // Check public cacheable routes
  for (const route of CACHEABLE_GET_ROUTES) {
    if (pathname === route.path || pathname.startsWith(route.path + '/')) {
      if (route.maxAge === 0) return null;
      return `public, s-maxage=${route.maxAge}, stale-while-revalidate=${route.swr}`;
    }
  }

  // Check admin cacheable routes (private cache only)
  for (const route of CACHEABLE_ADMIN_ROUTES) {
    if (pathname === route.path || pathname.startsWith(route.path + '/')) {
      return `private, s-maxage=${route.maxAge}, stale-while-revalidate=${route.swr}`;
    }
  }

  return null;
}

export function middleware(request) {
  const origin = request.headers.get('origin') || '';
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');

  // Handle preflight requests
  if (request.method === 'OPTIONS' && isApiRoute) {
    const response = new NextResponse(null, { status: 204 });
    
    // Set CORS headers
    if (isAllowedOrigin(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin || '*');
    }
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Cookie');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400');
    
    return response;
  }

  // For all other API requests, add CORS + Cache headers to response
  if (isApiRoute) {
    const response = NextResponse.next();
    
    if (isAllowedOrigin(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin || '*');
    }
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Cookie');

    // Add Cache-Control headers for cacheable GET routes
    const cacheControl = getCacheHeaders(request.nextUrl.pathname, request.method === 'GET');
    if (cacheControl) {
      response.headers.set('Cache-Control', cacheControl);
      // Also set CDN-Cache-Control for Vercel edge specifically
      response.headers.set('CDN-Cache-Control', cacheControl);
      // Vary by authorization so different users don't get same cached response
      response.headers.set('Vary', 'Authorization, Cookie');
    }
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
};
