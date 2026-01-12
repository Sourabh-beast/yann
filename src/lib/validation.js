/**
 * Input Validation Middleware using Zod
 * 
 * Prevents NoSQL injection, XSS, and data corruption by validating
 * all user inputs against defined schemas
 */

import { z } from 'zod';
import { NextResponse } from 'next/server';

/**
 * Common validation schemas
 */

// Phone number validation (10 digits)
export const phoneSchema = z.string()
    .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits')
    .or(z.string().regex(/^\+?\d{10,15}$/, 'Invalid phone number format'));

// Email validation
export const emailSchema = z.string()
    .email('Invalid email address')
    .max(255, 'Email too long');

// MongoDB ObjectId validation
export const objectIdSchema = z.string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

// Price validation (positive number, max 2 decimal places)
export const priceSchema = z.number()
    .positive('Price must be positive')
    .max(1000000, 'Price too high')
    .refine((val) => Number.isFinite(val), 'Price must be a valid number')
    .refine((val) => (val * 100) % 1 === 0, 'Price can have at most 2 decimal places');

// Date validation
export const dateSchema = z.string()
    .datetime({ message: 'Invalid date format' })
    .or(z.date());

// Time validation (HH:MM format)
export const timeSchema = z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format');

// Address validation
export const addressSchema = z.object({
    street: z.string().min(1).max(200),
    city: z.string().min(1).max(100),
    state: z.string().min(1).max(100),
    postalCode: z.string().regex(/^\d{6}$/, 'Postal code must be 6 digits'),
    label: z.string().min(1).max(50).optional()
});

/**
 * Booking creation validation schema
 */
export const bookingCreateSchema = z.object({
    serviceId: objectIdSchema,
    serviceName: z.string().min(1).max(200),
    serviceCategory: z.string().min(1).max(100),
    customerId: objectIdSchema.optional(),
    customerName: z.string().min(1).max(200),
    customerPhone: phoneSchema,
    customerAddress: z.string().min(1).max(500),
    bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'), // Accept date-only format
    bookingTime: timeSchema,
    providerId: objectIdSchema,
    basePrice: priceSchema.optional(),
    totalPrice: priceSchema.optional(),
    paymentMethod: z.enum(['cash', 'wallet', 'online']).default('cash'),
    billingType: z.enum(['one-time', 'monthly']).default('one-time'),
    quantity: z.number().int().positive().max(100).default(1),
    notes: z.string().max(1000).optional(),
    bookedHours: z.number().positive().max(24).optional(),
    extras: z.array(z.object({
        name: z.string().max(100),
        price: priceSchema
    })).optional(),
    driverDetails: z.object({
        startTime: timeSchema,
        endTime: timeSchema,
        baseHours: z.number().positive().max(24).optional(),
        hourlyRate: priceSchema.optional()
    }).optional(),
    driverRequirements: z.object({
        carType: z.string().max(50).optional(),
        licenseRequired: z.boolean().optional()
    }).optional()
});

/**
 * OTP validation schema
 */
export const otpSchema = z.object({
    identifier: z.string().min(1).max(255),
    otp: z.string().regex(/^\d{4,6}$/, 'OTP must be 4-6 digits'),
    audience: z.enum(['homeowner', 'provider']).optional(),
    intent: z.enum(['login', 'signup']).optional()
});

/**
 * Provider profile update schema
 */
export const providerProfileSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    phone: phoneSchema.optional(),
    experience: z.number().int().min(0).max(50).optional(),
    services: z.array(z.string().max(100)).max(20).optional(),
    workingHours: z.object({
        startTime: timeSchema,
        endTime: timeSchema
    }).optional(),
    profileImage: z.string().max(1000000).optional(), // Base64 image
    bio: z.string().max(1000).optional()
});

/**
 * Validate request body against a Zod schema
 * @param {Object} data - Request body data
 * @param {ZodSchema} schema - Zod validation schema
 * @returns {Object} Validation result
 */
export function validateInput(data, schema) {
    try {
        const validated = schema.parse(data);
        return { success: true, data: validated };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors = error.errors?.map(err => ({
                field: err.path.join('.'),
                message: err.message
            })) || [];

            return {
                success: false,
                message: 'Validation failed',
                errors
            };
        }

        return {
            success: false,
            message: 'Invalid input data'
        };
    }
}

/**
 * Middleware helper to validate request body
 * Usage in route handlers:
 * 
 * const body = await request.json();
 * const validation = validateInput(body, bookingCreateSchema);
 * if (!validation.success) {
 *   return NextResponse.json(
 *     { success: false, message: validation.message, errors: validation.errors },
 *     { status: 400 }
 *   );
 * }
 * const validatedData = validation.data;
 */
export function createValidationMiddleware(schema) {
    return async (request) => {
        try {
            const body = await request.json();
            const validation = validateInput(body, schema);

            if (!validation.success) {
                return {
                    valid: false,
                    response: NextResponse.json(
                        {
                            success: false,
                            message: validation.message,
                            errors: validation.errors
                        },
                        { status: 400 }
                    )
                };
            }

            return { valid: true, data: validation.data };
        } catch (error) {
            return {
                valid: false,
                response: NextResponse.json(
                    { success: false, message: 'Invalid JSON in request body' },
                    { status: 400 }
                )
            };
        }
    };
}

/**
 * Sanitize string to prevent XSS
 */
export function sanitizeString(str) {
    if (typeof str !== 'string') return str;

    // Remove any HTML tags
    return str
        .replace(/<[^>]*>/g, '')
        .trim();
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeString(value);
        } else if (typeof value === 'object') {
            sanitized[key] = sanitizeObject(value);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
}
