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

  // For all other API requests, add CORS headers to response
  if (isApiRoute) {
    const response = NextResponse.next();
    
    if (isAllowedOrigin(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin || '*');
    }
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Cookie');
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
};
