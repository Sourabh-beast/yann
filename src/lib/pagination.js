/**
 * Pagination Helper
 * 
 * Provides consistent pagination across all list endpoints
 */

/**
 * Parse pagination parameters from request
 * @param {Request} request - The incoming request
 * @returns {Object} Pagination parameters
 */
export function getPaginationParams(request) {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);

    // Validate and constrain values
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), 100); // Max 100 items per page

    const skip = (validPage - 1) * validLimit;

    return {
        page: validPage,
        limit: validLimit,
        skip
    };
}

/**
 * Create pagination metadata for response
 * @param {number} total - Total number of items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {Object} Pagination metadata
 */
export function createPaginationMeta(total, page, limit) {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
    };
}

/**
 * Apply pagination to a Mongoose query
 * Usage:
 * 
 * const { page, limit, skip } = getPaginationParams(request);
 * const query = Booking.find({ customerId });
 * const total = await Booking.countDocuments({ customerId });
 * const bookings = await query.skip(skip).limit(limit).sort({ createdAt: -1 });
 * const meta = createPaginationMeta(total, page, limit);
 */
