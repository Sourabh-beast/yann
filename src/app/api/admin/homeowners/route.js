import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Homeowner from '@/models/Homeowner';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const search = searchParams.get('search');

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count
    const total = await Homeowner.countDocuments(query);

    // Get homeowners with pagination
    const homeowners = await Homeowner.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('savedProviders', 'name services rating')
      .select('-__v');

    return NextResponse.json({
      success: true,
      data: {
        homeowners,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching homeowners:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch homeowners' },
      { status: 500 }
    );
  }
}

// POST - Block/Unblock or Delete homeowner
export async function POST(request) {
  try {
    await connectDB();

    const { id, action, reason } = await request.json();

    if (!id || !action) {
      return NextResponse.json(
        { success: false, message: 'Homeowner ID and action are required' },
        { status: 400 }
      );
    }

    if (action === 'block') {
      const homeowner = await Homeowner.findByIdAndUpdate(
        id,
        {
          isBlocked: true,
          blockedAt: new Date(),
          blockedReason: reason || 'Blocked by admin'
        },
        { new: true }
      );

      if (!homeowner) {
        return NextResponse.json(
          { success: false, message: 'Homeowner not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Homeowner blocked successfully',
        data: homeowner
      });
    }

    if (action === 'unblock') {
      const homeowner = await Homeowner.findByIdAndUpdate(
        id,
        {
          isBlocked: false,
          blockedAt: null,
          blockedReason: ''
        },
        { new: true }
      );

      if (!homeowner) {
        return NextResponse.json(
          { success: false, message: 'Homeowner not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Homeowner unblocked successfully',
        data: homeowner
      });
    }

    if (action === 'delete') {
      const homeowner = await Homeowner.findByIdAndDelete(id);

      if (!homeowner) {
        return NextResponse.json(
          { success: false, message: 'Homeowner not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Homeowner deleted successfully'
      });
    }

    if (action === 'verify') {
      const homeowner = await Homeowner.findByIdAndUpdate(
        id,
        { isVerified: true },
        { new: true }
      );

      if (!homeowner) {
        return NextResponse.json(
          { success: false, message: 'Homeowner not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Homeowner verified successfully',
        data: homeowner
      });
    }

    if (action === 'verify-document') {
      const body = await request.json();
      const documentType = body.documentType;
      const updatePath = `documents.${documentType}.verified`;
      const updateData = {
        [updatePath]: true,
        [`documents.${documentType}.verifiedAt`]: new Date()
      };

      const homeowner = await Homeowner.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      if (!homeowner) {
        return NextResponse.json(
          { success: false, message: 'Homeowner not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `${documentType} verified successfully`,
        data: homeowner
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing homeowner action:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process action' },
      { status: 500 }
    );
  }
}

