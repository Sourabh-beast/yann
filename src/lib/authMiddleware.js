/**
 * Authorization Middleware
 * 
 * Prevents IDOR (Insecure Direct Object Reference) vulnerabilities
 * by verifying resource ownership before allowing access
 */

import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

/**
 * Verify JWT token and extract user information
 * @param {Request} request - The incoming request
 * @returns {Object|null} Decoded token payload or null if invalid
 */
export function verifyAuthToken(request) {
    try {
        // Try to get token from Authorization header
        const authHeader = request.headers.get('authorization');
        let token = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }

        // Fallback to cookie if no Authorization header
        if (!token) {
            const cookieHeader = request.headers.get('cookie');
            if (cookieHeader) {
                const cookies = Object.fromEntries(
                    cookieHeader.split('; ').map(c => {
                        const [key, ...v] = c.split('=');
                        return [key, v.join('=')];
                    })
                );
                token = cookies.yann_session || cookies.yann_home_session || cookies.adminToken;
            }
        }

        if (!token) {
            return null;
        }

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET not configured');
            return null;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return null;
    }
}

/**
 * Middleware to require authentication
 * Returns 401 if not authenticated
 */
export function requireAuth(request) {
    const user = verifyAuthToken(request);

    if (!user) {
        return {
            authorized: false,
            response: NextResponse.json(
                { success: false, message: 'Authentication required' },
                { status: 401 }
            )
        };
    }

    return { authorized: true, user };
}

/**
 * Verify that the authenticated user owns the resource
 * @param {Object} user - Decoded JWT payload
 * @param {string} resourceOwnerId - ID of the resource owner
 * @param {string} audience - Expected audience ('homeowner' or 'provider')
 * @returns {boolean} True if authorized
 */
export function verifyOwnership(user, resourceOwnerId, audience = null) {
    if (!user || !resourceOwnerId) {
        return false;
    }

    // Check audience if specified
    if (audience && user.audience !== audience) {
        return false;
    }

    // Compare user ID with resource owner ID
    const userId = user.id || user._id;
    return userId === resourceOwnerId.toString();
}

/**
 * Middleware to require resource ownership
 * Usage in route handlers:
 * 
 * const authResult = requireAuth(request);
 * if (!authResult.authorized) return authResult.response;
 * 
 * const booking = await Booking.findById(bookingId);
 * if (!verifyOwnership(authResult.user, booking.customerId, 'homeowner')) {
 *   return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
 * }
 */
export function requireOwnership(user, resourceOwnerId, audience = null) {
    if (!verifyOwnership(user, resourceOwnerId, audience)) {
        return {
            authorized: false,
            response: NextResponse.json(
                { success: false, message: 'You do not have permission to access this resource' },
                { status: 403 }
            )
        };
    }

    return { authorized: true };
}

/**
 * Helper to extract user ID from request
 */
export function getUserIdFromRequest(request) {
    const user = verifyAuthToken(request);
    return user ? (user.id || user._id) : null;
}

/**
 * Helper to check if user has specific role
 */
export function hasRole(user, role) {
    return user && user.role === role;
}

/**
 * Require admin role
 */
export function requireAdmin(request) {
    const user = verifyAuthToken(request);

    if (!user || user.role !== 'admin') {
        return {
            authorized: false,
            response: NextResponse.json(
                { success: false, message: 'Admin access required' },
                { status: 403 }
            )
        };
    }

    return { authorized: true, user };
}
