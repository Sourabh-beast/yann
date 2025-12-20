import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import ServiceProvider from '@/models/ServiceProvider';
import Homeowner from '@/models/Homeowner';

// GET - Export users data as JSON (can be converted to CSV on frontend)
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // providers, homeowners, all
    const format = searchParams.get('format') || 'json'; // json, csv

    let data = {
      providers: [],
      homeowners: [],
      exportedAt: new Date().toISOString()
    };

    if (type === 'providers' || type === 'all') {
      const providers = await ServiceProvider.find({})
        .select('name email phone services experience status rating totalReviews isBlocked isVerified createdAt')
        .lean();

      data.providers = providers.map(p => ({
        id: p._id.toString(),
        name: p.name,
        email: p.email,
        phone: p.phone,
        services: p.services?.join(', ') || '',
        experience: p.experience,
        status: p.status,
        rating: p.rating,
        totalReviews: p.totalReviews,
        isBlocked: p.isBlocked ? 'Yes' : 'No',
        isVerified: p.isVerified ? 'Yes' : 'No',
        joinedAt: new Date(p.createdAt).toLocaleDateString('en-IN')
      }));
    }

    if (type === 'homeowners' || type === 'all') {
      const homeowners = await Homeowner.find({})
        .select('name email phone isBlocked isVerified createdAt')
        .lean();

      data.homeowners = homeowners.map(h => ({
        id: h._id.toString(),
        name: h.name,
        email: h.email,
        phone: h.phone || 'N/A',
        isBlocked: h.isBlocked ? 'Yes' : 'No',
        isVerified: h.isVerified ? 'Yes' : 'No',
        joinedAt: new Date(h.createdAt).toLocaleDateString('en-IN')
      }));
    }

    // If CSV format requested, convert to CSV
    if (format === 'csv') {
      let csvContent = '';

      if (data.providers.length > 0) {
        const providerHeaders = Object.keys(data.providers[0]).join(',');
        const providerRows = data.providers.map(p => Object.values(p).map(v => `"${v}"`).join(',')).join('\n');
        csvContent += `Service Providers\n${providerHeaders}\n${providerRows}\n\n`;
      }

      if (data.homeowners.length > 0) {
        const homeownerHeaders = Object.keys(data.homeowners[0]).join(',');
        const homeownerRows = data.homeowners.map(h => Object.values(h).map(v => `"${v}"`).join(',')).join('\n');
        csvContent += `Homeowners\n${homeownerHeaders}\n${homeownerRows}`;
      }

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="users_export_${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    return NextResponse.json({
      success: true,
      data,
      counts: {
        providers: data.providers.length,
        homeowners: data.homeowners.length,
        total: data.providers.length + data.homeowners.length
      }
    });
  } catch (error) {
    console.error('Error exporting users:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to export users' },
      { status: 500 }
    );
  }
}
