import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import ResidentRequest from '@/models/ResidentRequest';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');

    // Build query
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { serviceType: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count
    const total = await ResidentRequest.countDocuments(query);

    // Get requests with pagination
    const requests = await ResidentRequest.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('homeowner', 'name email phone')
      .select('-__v');

    return NextResponse.json({
      success: true,
      data: {
        requests,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    await connectDB();

    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: 'Request ID and status are required' },
        { status: 400 }
      );
    }

    const residentRequest = await ResidentRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('homeowner', 'name email');

    if (!residentRequest) {
      return NextResponse.json(
        { success: false, message: 'Request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: residentRequest,
      message: 'Request status updated successfully'
    });
  } catch (error) {
    console.error('Error updating request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update request' },
      { status: 500 }
    );
  }
}
