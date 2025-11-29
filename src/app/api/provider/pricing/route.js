import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import ServiceProvider from '@/models/ServiceProvider';

const normalizeName = (name = '') => name.trim().toLowerCase();

export async function POST(request) {
  try {
    const body = await request.json();
    const services = Array.isArray(body?.services) ? body.services : [];

    if (!services.length) {
      return NextResponse.json(
        { success: false, message: 'services array is required' },
        { status: 400 }
      );
    }

    const uniqueServices = [];
    const normalizedToOriginal = {};

    services.forEach((serviceName) => {
      if (typeof serviceName !== 'string') return;
      const trimmed = serviceName.trim();
      if (!trimmed) return;
      const normalized = normalizeName(trimmed);
      if (normalizedToOriginal[normalized]) return;
      normalizedToOriginal[normalized] = trimmed;
      uniqueServices.push(normalized);
    });

    if (!uniqueServices.length) {
      return NextResponse.json(
        { success: false, message: 'No valid service names provided' },
        { status: 400 }
      );
    }

    await connectDB();

    const providers = await ServiceProvider.find({
      status: 'active',
      serviceRates: { $exists: true, $ne: [] }
    }).select('serviceRates');

    const pricingMap = {};
    const providerSets = {};

    providers.forEach((provider) => {
      provider.serviceRates?.forEach((rate) => {
        const normalized = normalizeName(rate?.serviceName || '');
        if (!normalized || !normalizedToOriginal[normalized]) return;
        if (typeof rate.price !== 'number') return;
        const originalName = normalizedToOriginal[normalized];
        if (!pricingMap[originalName] || rate.price < pricingMap[originalName]) {
          pricingMap[originalName] = rate.price;
        }
        if (!providerSets[originalName]) {
          providerSets[originalName] = new Set();
        }
        providerSets[originalName].add(provider._id.toString());
      });
    });

    const responsePayload = {};
    Object.entries(normalizedToOriginal).forEach(([, originalName]) => {
      if (pricingMap[originalName] !== undefined) {
        responsePayload[originalName] = {
          price: pricingMap[originalName],
          providerCount: providerSets[originalName]?.size || 0
        };
      }
    });

    console.log('📊 Pricing API - Found providers:', providers.length);
    console.log('📊 Pricing API - Response payload:', responsePayload);

    return NextResponse.json(
      { success: true, pricing: responsePayload },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to build pricing summary', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load pricing summary' },
      { status: 500 }
    );
  }
}
