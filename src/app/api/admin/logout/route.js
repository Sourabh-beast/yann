import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    response.cookies.delete('adminToken');

    return response;
  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Logout failed' },
      { status: 500 }
    );
  }
}
