import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Coupon from '@/models/Coupon';
import AuditLog from '@/models/AuditLog';

// GET - Fetch coupons
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    
    const query = {};
    
    if (status === 'active') {
      query.isActive = true;
      query.endDate = { $gte: new Date() };
    } else if (status === 'inactive') {
      query.isActive = false;
    } else if (status === 'expired') {
      query.endDate = { $lt: new Date() };
    }
    
    if (type) query.couponType = type;
    
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }
    
    const [coupons, total, stats] = await Promise.all([
      Coupon.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Coupon.countDocuments(query),
      Coupon.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { 
              $sum: { 
                $cond: [
                  { $and: [
                    { $eq: ['$isActive', true] },
                    { $gte: ['$endDate', new Date()] }
                  ]},
                  1, 0
                ]
              }
            },
            expired: {
              $sum: { $cond: [{ $lt: ['$endDate', new Date()] }, 1, 0] }
            },
            totalUsage: { $sum: '$usageCount' },
            totalDiscount: {
              $sum: {
                $reduce: {
                  input: '$usedBy',
                  initialValue: 0,
                  in: { $add: ['$$value', { $ifNull: ['$$this.discountApplied', 0] }] }
                }
              }
            }
          }
        }
      ])
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        coupons,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        stats: stats[0] || { total: 0, active: 0, expired: 0, totalUsage: 0, totalDiscount: 0 }
      }
    });
  } catch (error) {
    console.error('Coupons fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

// POST - Create new coupon
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const {
      code, name, description, discountType, discountValue,
      maxDiscount, minOrderValue, startDate, endDate,
      usageLimit, perUserLimit, applicableTo, applicableServices,
      couponType, referralDetails
    } = body;
    
    if (!code || !name || !discountType || !discountValue || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: 'Required fields missing' },
        { status: 400 }
      );
    }
    
    // Check if code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return NextResponse.json(
        { success: false, message: 'Coupon code already exists' },
        { status: 400 }
      );
    }
    
    const coupon = new Coupon({
      code: code.toUpperCase(),
      name,
      description,
      discountType,
      discountValue,
      maxDiscount,
      minOrderValue: minOrderValue || 0,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      usageLimit,
      perUserLimit: perUserLimit || 1,
      applicableTo: applicableTo || 'all',
      applicableServices,
      couponType: couponType || 'promo',
      referralDetails,
      createdBy: 'Admin'
    });
    
    await coupon.save();
    
    await AuditLog.log({
      action: 'coupon_create',
      performedBy: { adminName: 'Admin' },
      target: { type: 'coupon', id: coupon._id, name: coupon.code },
      description: `Coupon created: ${coupon.code} - ${coupon.name}`,
      category: 'content',
      severity: 'info'
    });
    
    return NextResponse.json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon
    });
  } catch (error) {
    console.error('Coupon create error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create coupon' },
      { status: 500 }
    );
  }
}

// PUT - Update coupon
export async function PUT(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Coupon ID required' },
        { status: 400 }
      );
    }
    
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return NextResponse.json(
        { success: false, message: 'Coupon not found' },
        { status: 404 }
      );
    }
    
    // Update fields
    Object.keys(updates).forEach(key => {
      if (key === 'startDate' || key === 'endDate') {
        coupon[key] = new Date(updates[key]);
      } else if (key === 'code') {
        coupon[key] = updates[key].toUpperCase();
      } else {
        coupon[key] = updates[key];
      }
    });
    
    await coupon.save();
    
    await AuditLog.log({
      action: 'coupon_update',
      performedBy: { adminName: 'Admin' },
      target: { type: 'coupon', id: coupon._id, name: coupon.code },
      description: `Coupon updated: ${coupon.code}`,
      category: 'content',
      severity: 'info'
    });
    
    return NextResponse.json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon
    });
  } catch (error) {
    console.error('Coupon update error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update coupon' },
      { status: 500 }
    );
  }
}

// DELETE - Delete coupon
export async function DELETE(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Coupon ID required' },
        { status: 400 }
      );
    }
    
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return NextResponse.json(
        { success: false, message: 'Coupon not found' },
        { status: 404 }
      );
    }
    
    await Coupon.findByIdAndDelete(id);
    
    await AuditLog.log({
      action: 'coupon_delete',
      performedBy: { adminName: 'Admin' },
      target: { type: 'coupon', id: coupon._id, name: coupon.code },
      description: `Coupon deleted: ${coupon.code}`,
      category: 'content',
      severity: 'warning'
    });
    
    return NextResponse.json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    console.error('Coupon delete error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete coupon' },
      { status: 500 }
    );
  }
}

// PATCH - Toggle coupon status
export async function PATCH(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Coupon ID required' },
        { status: 400 }
      );
    }
    
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return NextResponse.json(
        { success: false, message: 'Coupon not found' },
        { status: 404 }
      );
    }
    
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    
    return NextResponse.json({
      success: true,
      message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`,
      data: coupon
    });
  } catch (error) {
    console.error('Coupon toggle error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to toggle coupon status' },
      { status: 500 }
    );
  }
}
