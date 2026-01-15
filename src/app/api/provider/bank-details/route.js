import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import ServiceProvider from '@/models/ServiceProvider';

/**
 * GET /api/provider/bank-details
 * Get provider's bank details
 */
export async function GET(req) {
    try {
        const providerId = req.headers.get('x-user-id');

        if (!providerId) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        const provider = await ServiceProvider.findById(providerId)
            .select('documents.bankDetails');

        if (!provider) {
            return NextResponse.json(
                { success: false, message: 'Provider not found' },
                { status: 404 }
            );
        }

        const bankDetails = provider.documents?.bankDetails || {};
        const hasBankDetails = !!(bankDetails.accountNumber && bankDetails.ifscCode);

        return NextResponse.json({
            success: true,
            data: {
                hasBankDetails,
                accountNumber: hasBankDetails ? 
                    `****${bankDetails.accountNumber.slice(-4)}` : null,
                ifscCode: bankDetails.ifscCode || null,
                bankName: bankDetails.bankName || null,
                verified: bankDetails.verified || false,
                verifiedAt: bankDetails.verifiedAt || null
            }
        });

    } catch (error) {
        console.error('Get bank details error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to get bank details'
        }, { status: 500 });
    }
}

/**
 * POST /api/provider/bank-details
 * Add or update provider's bank details
 */
export async function POST(req) {
    try {
        const providerId = req.headers.get('x-user-id');

        if (!providerId) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { accountNumber, ifscCode, bankName } = await req.json();

        // Validate required fields
        if (!accountNumber || !ifscCode) {
            return NextResponse.json({
                success: false,
                message: 'Account number and IFSC code are required'
            }, { status: 400 });
        }

        // Validate account number format (9-18 digits)
        if (!/^\d{9,18}$/.test(accountNumber)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid account number format (must be 9-18 digits)'
            }, { status: 400 });
        }

        // Validate IFSC code format (11 characters)
        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode.toUpperCase())) {
            return NextResponse.json({
                success: false,
                message: 'Invalid IFSC code format (e.g., SBIN0001234)'
            }, { status: 400 });
        }

        await connectDB();

        const provider = await ServiceProvider.findById(providerId);

        if (!provider) {
            return NextResponse.json(
                { success: false, message: 'Provider not found' },
                { status: 404 }
            );
        }

        // Update bank details
        if (!provider.documents) {
            provider.documents = {};
        }

        provider.documents.bankDetails = {
            accountNumber,
            ifscCode: ifscCode.toUpperCase(),
            bankName: bankName || 'Not Specified',
            verified: false, // Admin needs to verify
            verifiedAt: null
        };

        await provider.save();

        console.log(`✅ Bank details updated for provider: ${provider.name}`);
        console.log(`   Account: ****${accountNumber.slice(-4)}`);
        console.log(`   IFSC: ${ifscCode.toUpperCase()}`);

        return NextResponse.json({
            success: true,
            message: 'Bank details updated successfully',
            data: {
                accountNumber: `****${accountNumber.slice(-4)}`,
                ifscCode: ifscCode.toUpperCase(),
                bankName: bankName || 'Not Specified',
                verified: false
            }
        });

    } catch (error) {
        console.error('Update bank details error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to update bank details'
        }, { status: 500 });
    }
}
