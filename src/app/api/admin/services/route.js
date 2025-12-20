import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Service from '@/models/Service';

// GET - Fetch all services with filters
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query.category = category;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    // Get total count
    const total = await Service.countDocuments(query);

    // Get services
    const services = await Service.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-__v');

    // Get unique categories
    const categories = await Service.distinct('category');

    return NextResponse.json({
      success: true,
      data: {
        services,
        categories,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

// POST - Create new service
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      title,
      description,
      category,
      price,
      basePrice,
      minPrice,
      maxPrice,
      features,
      icon,
      image,
      popular,
      order,
      isActive,
      estimatedDuration,
      tags
    } = body;

    // Validation
    if (!title || !description || !category) {
      return NextResponse.json(
        { success: false, message: 'Title, description and category are required' },
        { status: 400 }
      );
    }

    // Check if service with same title exists
    const existingService = await Service.findOne({ title: { $regex: `^${title}$`, $options: 'i' } });
    if (existingService) {
      return NextResponse.json(
        { success: false, message: 'Service with this title already exists' },
        { status: 400 }
      );
    }

    const service = await Service.create({
      title,
      description,
      category: category.toLowerCase(),
      price: price || 'Starting from ₹0',
      basePrice: basePrice || 0,
      minPrice: minPrice || 0,
      maxPrice: maxPrice || 0,
      features: features || [],
      icon: icon || '🏠',
      image: image || '',
      popular: popular || false,
      order: order || 0,
      isActive: isActive !== false,
      estimatedDuration: estimatedDuration || 60,
      tags: tags || []
    });

    return NextResponse.json({
      success: true,
      message: 'Service created successfully',
      data: service
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create service' },
      { status: 500 }
    );
  }
}

// PUT - Update service
export async function PUT(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Service ID is required' },
        { status: 400 }
      );
    }

    // If category is being updated, normalize it
    if (updateData.category) {
      updateData.category = updateData.category.toLowerCase();
    }

    const service = await Service.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!service) {
      return NextResponse.json(
        { success: false, message: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Service updated successfully',
      data: service
    });
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update service' },
      { status: 500 }
    );
  }
}

// DELETE - Delete service
export async function DELETE(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Service ID is required' },
        { status: 400 }
      );
    }

    const service = await Service.findByIdAndDelete(id);

    if (!service) {
      return NextResponse.json(
        { success: false, message: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete service' },
      { status: 500 }
    );
  }
}

// PATCH - Toggle service status
export async function PATCH(request) {
  try {
    await connectDB();

    const { id, isActive } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Service ID is required' },
        { status: 400 }
      );
    }

    const service = await Service.findByIdAndUpdate(
      id,
      { isActive, updatedAt: new Date() },
      { new: true }
    );

    if (!service) {
      return NextResponse.json(
        { success: false, message: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Service ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: service
    });
  } catch (error) {
    console.error('Error toggling service status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update service status' },
      { status: 500 }
    );
  }
}
