import { NextResponse } from 'next/server';
import Homeowner from '@/models/Homeowner';
import ServiceProvider from '@/models/ServiceProvider';
import connectDB from '@/lib/connectDB';

/**
 * GET /api/identity/pending
 * Get all pending identity verifications (Admin only)
 * 
 * Query params:
 * - userType: 'homeowner' | 'provider' | 'all'
 */
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userType = searchParams.get('userType') || 'all';

    console.log('📋 Fetching pending identity verifications for:', userType);

    // TODO: Add admin authentication check here

    const query = { identityVerificationStatus: 'pending' };
    const projection = {
      name: 1,
      email: 1,
      phone: 1,
      avatar: 1,
      identityType: 1,
      identityVerificationStatus: 1,
      identityDocuments: 1,
      identitySubmittedAt: 1,
      createdAt: 1,
    };

    let homeowners = [];
    let providers = [];

    if (userType === 'all' || userType === 'homeowner') {
      homeowners = await Homeowner.find(query, projection)
        .sort({ identitySubmittedAt: -1 })
        .lean();
      
      homeowners = homeowners.map(h => ({ ...h, userType: 'homeowner' }));
    }

    if (userType === 'all' || userType === 'provider') {
      providers = await ServiceProvider.find(query, projection)
        .sort({ identitySubmittedAt: -1 })
        .lean();
      
      providers = providers.map(p => ({ ...p, userType: 'provider' }));
    }

    const allPending = [...homeowners, ...providers].sort((a, b) => 
      new Date(b.identitySubmittedAt) - new Date(a.identitySubmittedAt)
    );

    console.log(`✅ Found ${allPending.length} pending verifications`);

    return NextResponse.json({
      success: true,
      data: {
        pending: allPending,
        count: allPending.length,
      },
    });

  } catch (error) {
    console.error('❌ Error fetching pending verifications:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
