import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Admin from '@/models/Admin';
import PlatformSettings from '@/models/PlatformSettings';
import AuditLog from '@/models/AuditLog';
import { requireAdmin } from '@/lib/authMiddleware';

// GET - Fetch admins list or platform settings
export async function GET(request) {
  try {
    const auth = requireAdmin(request);
    if (!auth.authorized) return auth.response;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'admins';
    
    if (type === 'settings') {
      const settings = await PlatformSettings.getSettings();
      return NextResponse.json({
        success: true,
        data: settings
      });
    }
    
    if (type === 'admins') {
      const page = parseInt(searchParams.get('page')) || 1;
      const limit = parseInt(searchParams.get('limit')) || 20;
      const role = searchParams.get('role');
      const search = searchParams.get('search');
      
      const query = {};
      if (role) query.role = role;
      if (search) {
        query.$or = [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      
      const [admins, total] = await Promise.all([
        Admin.find(query)
          .select('-password')
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Admin.countDocuments(query)
      ]);
      
      return NextResponse.json({
        success: true,
        data: {
          admins,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    }
    
    return NextResponse.json(
      { success: false, message: 'Invalid type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

// POST - Create new admin
export async function POST(request) {
  try {
    const auth = requireAdmin(request);
    if (!auth.authorized) return auth.response;

    await connectDB();

    const body = await request.json();
    const { action } = body;
    
    if (action === 'create_admin') {
      const { fullName, email, phone, password, role, permissions } = body;
      
      if (!fullName || !email || !password) {
        return NextResponse.json(
          { success: false, message: 'Name, email, and password are required' },
          { status: 400 }
        );
      }
      
      // Check if email already exists
      const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
      if (existingAdmin) {
        return NextResponse.json(
          { success: false, message: 'Email already exists' },
          { status: 400 }
        );
      }
      
      // Set default permissions based on role
      let adminPermissions = permissions;
      if (!permissions) {
        switch (role) {
          case 'super_admin':
            adminPermissions = {
              dashboard: true, analytics: true, services: true, providers: true,
              homeowners: true, bookings: true, reviews: true, financials: true,
              notifications: true, promotions: true, support: true, settings: true,
              logs: true, manageAdmins: true
            };
            break;
          case 'admin':
            adminPermissions = {
              dashboard: true, analytics: true, services: true, providers: true,
              homeowners: true, bookings: true, reviews: true, financials: true,
              notifications: true, promotions: true, support: true, settings: false,
              logs: false, manageAdmins: false
            };
            break;
          case 'moderator':
            adminPermissions = {
              dashboard: true, analytics: false, services: true, providers: true,
              homeowners: true, bookings: true, reviews: true, financials: false,
              notifications: false, promotions: false, support: true, settings: false,
              logs: false, manageAdmins: false
            };
            break;
          case 'support':
            adminPermissions = {
              dashboard: true, analytics: false, services: false, providers: false,
              homeowners: true, bookings: true, reviews: false, financials: false,
              notifications: false, promotions: false, support: true, settings: false,
              logs: false, manageAdmins: false
            };
            break;
        }
      }
      
      const admin = new Admin({
        fullName,
        email: email.toLowerCase(),
        phone,
        password,
        role: role || 'admin',
        permissions: adminPermissions
      });
      
      await admin.save();
      
      // Log the action
      await AuditLog.log({
        action: 'admin_create',
        performedBy: { adminName: 'System' },
        target: { type: 'admin', id: admin._id, name: admin.fullName },
        description: `New admin created: ${admin.fullName} (${admin.role})`,
        category: 'admin',
        severity: 'info'
      });
      
      const adminData = admin.toObject();
      delete adminData.password;
      
      return NextResponse.json({
        success: true,
        message: 'Admin created successfully',
        data: adminData
      });
    }
    
    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Admin create error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create admin' },
      { status: 500 }
    );
  }
}

// PUT - Update admin or platform settings
export async function PUT(request) {
  try {
    const auth = requireAdmin(request);
    if (!auth.authorized) return auth.response;

    await connectDB();

    const body = await request.json();
    const { type } = body;
    
    if (type === 'settings') {
      const { settings } = body;
      
      const platformSettings = await PlatformSettings.findOneAndUpdate(
        { key: 'platform_settings' },
        {
          ...settings,
          lastUpdatedBy: {
            adminName: body.adminName || 'Admin',
            updatedAt: new Date()
          }
        },
        { new: true, upsert: true, runValidators: true, context: 'query' }
      );
      
      await AuditLog.log({
        action: 'platform_settings_update',
        performedBy: { adminName: body.adminName || 'Admin' },
        target: { type: 'settings', name: 'Platform Settings' },
        description: 'Platform settings updated',
        category: 'other',
        severity: 'info'
      });
      
      return NextResponse.json({
        success: true,
        message: 'Settings updated successfully',
        data: platformSettings
      });
    }
    
    if (type === 'admin') {
      const { adminId, updates } = body;
      
      const admin = await Admin.findById(adminId);
      if (!admin) {
        return NextResponse.json(
          { success: false, message: 'Admin not found' },
          { status: 404 }
        );
      }
      
      // Update fields
      if (updates.fullName) admin.fullName = updates.fullName;
      if (updates.phone) admin.phone = updates.phone;
      if (updates.role) admin.role = updates.role;
      if (updates.permissions) admin.permissions = updates.permissions;
      if (updates.isActive !== undefined) admin.isActive = updates.isActive;
      
      await admin.save();
      
      await AuditLog.log({
        action: 'admin_update',
        performedBy: { adminName: body.adminName || 'Admin' },
        target: { type: 'admin', id: admin._id, name: admin.fullName },
        description: `Admin updated: ${admin.fullName}`,
        category: 'admin',
        severity: 'info'
      });
      
      const adminData = admin.toObject();
      delete adminData.password;
      
      return NextResponse.json({
        success: true,
        message: 'Admin updated successfully',
        data: adminData
      });
    }
    
    return NextResponse.json(
      { success: false, message: 'Invalid type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Update error:', error);
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Failed to update' },
      { status: 500 }
    );
  }
}

// DELETE - Delete admin
export async function DELETE(request) {
  try {
    const auth = requireAdmin(request);
    if (!auth.authorized) return auth.response;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('id');
    
    if (!adminId) {
      return NextResponse.json(
        { success: false, message: 'Admin ID required' },
        { status: 400 }
      );
    }
    
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Admin not found' },
        { status: 404 }
      );
    }
    
    // Prevent deleting super admin
    if (admin.role === 'super_admin') {
      const superAdminCount = await Admin.countDocuments({ role: 'super_admin' });
      if (superAdminCount <= 1) {
        return NextResponse.json(
          { success: false, message: 'Cannot delete the only super admin' },
          { status: 400 }
        );
      }
    }
    
    await Admin.findByIdAndDelete(adminId);
    
    await AuditLog.log({
      action: 'admin_delete',
      performedBy: { adminName: 'Admin' },
      target: { type: 'admin', id: admin._id, name: admin.fullName },
      description: `Admin deleted: ${admin.fullName}`,
      category: 'admin',
      severity: 'warning'
    });
    
    return NextResponse.json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete admin' },
      { status: 500 }
    );
  }
}

// PATCH - Change password or toggle status
export async function PATCH(request) {
  try {
    const auth = requireAdmin(request);
    if (!auth.authorized) return auth.response;

    await connectDB();

    const body = await request.json();
    const { adminId, action, oldPassword, newPassword } = body;
    
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Admin not found' },
        { status: 404 }
      );
    }
    
    if (action === 'change_password') {
      // Verify old password
      const isMatch = await admin.comparePassword(oldPassword);
      if (!isMatch) {
        return NextResponse.json(
          { success: false, message: 'Current password is incorrect' },
          { status: 400 }
        );
      }
      
      admin.password = newPassword;
      admin.passwordChangedAt = new Date();
      await admin.save();
      
      await AuditLog.log({
        action: 'password_change',
        performedBy: { adminId: admin._id, adminName: admin.fullName },
        target: { type: 'admin', id: admin._id, name: admin.fullName },
        description: 'Password changed',
        category: 'auth',
        severity: 'info'
      });
      
      return NextResponse.json({
        success: true,
        message: 'Password changed successfully'
      });
    }
    
    if (action === 'toggle_status') {
      admin.isActive = !admin.isActive;
      await admin.save();
      
      await AuditLog.log({
        action: admin.isActive ? 'admin_activate' : 'admin_deactivate',
        performedBy: { adminName: 'Admin' },
        target: { type: 'admin', id: admin._id, name: admin.fullName },
        description: `Admin ${admin.isActive ? 'activated' : 'deactivated'}: ${admin.fullName}`,
        category: 'admin',
        severity: 'info'
      });
      
      return NextResponse.json({
        success: true,
        message: `Admin ${admin.isActive ? 'activated' : 'deactivated'} successfully`
      });
    }
    
    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Patch error:', error);
    return NextResponse.json(
      { success: false, message: 'Operation failed' },
      { status: 500 }
    );
  }
}
