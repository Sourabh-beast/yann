import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import ServiceProvider from '@/models/ServiceProvider';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const service = searchParams.get('service');

    // Build query
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    if (service) query.services = service;

    // Get total count
    const total = await ServiceProvider.countDocuments(query);

    // Get providers with pagination
    const providers = await ServiceProvider.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-__v');

    return NextResponse.json({
      success: true,
      data: {
        providers,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch providers' },
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
        { success: false, message: 'Provider ID and status are required' },
        { status: 400 }
      );
    }

    const provider = await ServiceProvider.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: provider,
      message: 'Provider status updated successfully'
    });
  } catch (error) {
    console.error('Error updating provider:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update provider' },
      { status: 500 }
    );
  }
}
