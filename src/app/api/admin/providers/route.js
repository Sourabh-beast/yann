import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import ServiceProvider from '@/models/ServiceProvider';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 100; // Increased for admin panel
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const service = searchParams.get('service');
    const simple = searchParams.get('simple'); // For admin panel simple view

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
      .select('-__v -password');

    // Simple format for admin panel
    if (simple === 'true') {
      return NextResponse.json({
        success: true,
        providers: providers.map(p => ({
          _id: p._id.toString(),
          name: p.name,
          email: p.email,
          phone: p.phone,
          services: p.services,
          experience: p.experience,
          status: p.status,
          rating: p.rating,
          totalReviews: p.totalReviews
        }))
      });
    }

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

    // When approving (setting to active), also mark as admin approved
    const updateData = { status };
    if (status === 'active') {
      updateData.adminApproved = true;
      updateData.adminApprovedAt = new Date();
      updateData.adminApprovedBy = 'admin'; // You can pass admin ID from session
      updateData.isOnline = true;
    }

    const provider = await ServiceProvider.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      );
    }

    // Log the approval for audit trail
    console.log(`✅ Provider ${provider.name} (${provider._id}) approved:`, {
      status: provider.status,
      experience: provider.experience,
      services: provider.services,
      serviceRates: provider.serviceRates?.map(r => ({ service: r.serviceName, price: r.price })),
      serviceExperiences: provider.serviceExperiences?.map(e => ({ service: e.serviceName, years: e.years }))
    });

    return NextResponse.json({
      success: true,
      data: provider,
      message: `Provider ${status === 'active' ? 'approved and activated' : 'status updated'} successfully`
    });
  } catch (error) {
    console.error('Error updating provider:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update provider' },
      { status: 500 }
    );
  }
}

// POST - Block/Unblock or Delete provider
export async function POST(request) {
  try {
    await connectDB();

    const { id, action, reason } = await request.json();

    if (!id || !action) {
      return NextResponse.json(
        { success: false, message: 'Provider ID and action are required' },
        { status: 400 }
      );
    }

    if (action === 'block') {
      const provider = await ServiceProvider.findByIdAndUpdate(
        id,
        {
          isBlocked: true,
          blockedAt: new Date(),
          blockedReason: reason || 'Blocked by admin',
          status: 'inactive'
        },
        { new: true }
      );

      if (!provider) {
        return NextResponse.json(
          { success: false, message: 'Provider not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Provider blocked successfully',
        data: provider
      });
    }

    if (action === 'unblock') {
      const provider = await ServiceProvider.findByIdAndUpdate(
        id,
        {
          isBlocked: false,
          blockedAt: null,
          blockedReason: '',
          status: 'active'
        },
        { new: true }
      );

      if (!provider) {
        return NextResponse.json(
          { success: false, message: 'Provider not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Provider unblocked successfully',
        data: provider
      });
    }

    if (action === 'delete') {
      const provider = await ServiceProvider.findByIdAndDelete(id);

      if (!provider) {
        return NextResponse.json(
          { success: false, message: 'Provider not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Provider deleted successfully'
      });
    }

    if (action === 'verify') {
      const provider = await ServiceProvider.findByIdAndUpdate(
        id,
        { isVerified: true },
        { new: true }
      );

      if (!provider) {
        return NextResponse.json(
          { success: false, message: 'Provider not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Provider verified successfully',
        data: provider
      });
    }

    if (action === 'verify-document') {
      const { documentType } = await request.json();
      const updatePath = `documents.${documentType}.verified`;
      const updateData = {
        [updatePath]: true,
        [`documents.${documentType}.verifiedAt`]: new Date()
      };

      const provider = await ServiceProvider.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      if (!provider) {
        return NextResponse.json(
          { success: false, message: 'Provider not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `${documentType} verified successfully`,
        data: provider
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing provider action:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process action' },
      { status: 500 }
    );
  }
}

