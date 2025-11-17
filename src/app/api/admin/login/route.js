import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Admin credentials - In production, store this securely in database
const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || 'admin@yann.com',
  password: process.env.ADMIN_PASSWORD || 'admin@123' // Change this in production
};

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validate credentials
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      // Create admin token
      const token = jwt.sign(
        { email, role: 'admin', timestamp: Date.now() },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Set cookie
      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
        admin: { email, role: 'admin' }
      });

      response.cookies.set('adminToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 86400 // 24 hours
      });

      return response;
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, message: 'Login failed' },
      { status: 500 }
    );
  }
}
