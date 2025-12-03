import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Service from '@/models/Service';

/**
 * GET /api/services
 * Fetch all services or filter by category
 * Query params: category (optional)
 */
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // Build query
    const query = {};
    if (category) {
      query.category = category;
    }

    // Get services from database
    const services = await Service.find(query)
      .sort({ popular: -1, order: 1, createdAt: -1 })
      .select('-__v');

    return NextResponse.json({
      success: true,
      data: services.map(service => ({
        id: service._id.toString(),
        title: service.title,
        description: service.description,
        category: service.category,
        price: service.price,
        features: service.features || [],
        icon: service.icon || '🏠',
        popular: service.popular || false,
      }))
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/services
 * Create a new service (admin only)
 */
export async function POST(request) {
  try {
    await connectDB();

    let payload;
    try {
      payload = await request.json();
    } catch (err) {
      return NextResponse.json(
        { success: false, message: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { title, description, category, price, features, icon, popular } = payload;

    if (!title || !description || !category || !price) {
      return NextResponse.json(
        { success: false, message: 'Title, description, category, and price are required' },
        { status: 400 }
      );
    }

    const service = await Service.create({
      title,
      description,
      category,
      price,
      features: features || [],
      icon: icon || '🏠',
      popular: popular || false,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Service created successfully',
        data: {
          id: service._id.toString(),
          title: service.title,
          description: service.description,
          category: service.category,
          price: service.price,
          features: service.features,
          icon: service.icon,
          popular: service.popular,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create service' },
      { status: 500 }
    );
  }
}
