import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import ServiceProvider from '@/models/ServiceProvider';
import Transaction from '@/models/Transaction';
import AdminWallet from '@/models/AdminWallet';
import PlatformSettings from '@/models/PlatformSettings';

/**
 * POST /api/wallet/withdraw
 * 
 * Partner Withdrawal Flow:
 * 1. Validate withdrawal amount against balance and limits
 * 2. Calculate commission (10-20%)
 * 3. Deduct full amount from partner wallet
 * 4. Credit commission to admin wallet
 * 5. Create withdrawal request transaction
 * 
 * Auto-approve for amounts below threshold, otherwise pending admin approval.
 */
export async function POST(req) {
    try {
        // Extract provider ID from request headers
        const providerId = req.headers.get('x-user-id');

        if (!providerId) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized - Provider ID required' },
                { status: 401 }
            );
        }

        const { amount } = await req.json();

        if (!amount || amount <= 0) {
            return NextResponse.json(
                { success: false, message: 'Valid withdrawal amount is required' },
                { status: 400 }
            );
        }

        await connectDB();

        // Validate MongoDB ObjectId format
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(providerId)) {
            return NextResponse.json(
                { success: false, message: 'Invalid provider ID format' },
                { status: 400 }
            );
        }

        // Find the provider
        const provider = await ServiceProvider.findById(providerId);
        if (!provider) {
            return NextResponse.json(
                { success: false, message: 'Provider not found' },
                { status: 404 }
            );
        }

        // Get platform settings
        const settings = await PlatformSettings.getSettings();
        const walletConfig = settings.walletPayment || {};

        const commissionRate = walletConfig.partnerWithdrawalCommission || 15; // 15% default
        const minWithdrawal = walletConfig.minWithdrawalAmount || 100;
        const maxWithdrawal = walletConfig.maxWithdrawalAmount || 100000;
        const autoApproveLimit = walletConfig.autoApproveWithdrawalLimit || 1000;
        const processingDays = walletConfig.withdrawalProcessingDays || 3;

        const providerBalance = provider.wallet?.balance || 0;

        console.log('💰 Withdrawal request:');
        console.log(`   Provider: ${provider.name}`);
        console.log(`   Balance: ₹${providerBalance}`);
        console.log(`   Requested: ₹${amount}`);
        console.log(`   Commission rate: ${commissionRate}%`);

        // Validate minimum withdrawal
        if (amount < minWithdrawal) {
            return NextResponse.json({
                success: false,
                message: `Minimum withdrawal amount is ₹${minWithdrawal}`,
                minWithdrawal
            }, { status: 400 });
        }

        // Validate maximum withdrawal
        if (amount > maxWithdrawal) {
            return NextResponse.json({
                success: false,
                message: `Maximum withdrawal amount is ₹${maxWithdrawal} per transaction`,
                maxWithdrawal
            }, { status: 400 });
        }

        // Validate sufficient balance
        if (providerBalance < amount) {
            return NextResponse.json({
                success: false,
                message: 'Insufficient wallet balance',
                available: providerBalance,
                requested: amount
            }, { status: 400 });
        }

        // Validate bank details exist
        if (!provider.documents?.bankDetails?.accountNumber || !provider.documents?.bankDetails?.ifscCode) {
            return NextResponse.json({
                success: false,
                message: 'Please add your bank account details before withdrawing',
                requiresBankDetails: true
            }, { status: 400 });
        }

        // Calculate amounts
        const commissionAmount = Math.round(amount * (commissionRate / 100) * 100) / 100;
        const netAmount = Math.round((amount - commissionAmount) * 100) / 100;

        console.log(`   Commission: ₹${commissionAmount} (${commissionRate}%)`);
        console.log(`   Net to partner: ₹${netAmount}`);

        // Determine if auto-approve
        const autoApproved = amount <= autoApproveLimit;

        // Use MongoDB transaction
        const session = await ServiceProvider.startSession();
        session.startTransaction();

        try {
            const providerBalanceBefore = providerBalance;
            const providerBalanceAfter = providerBalance - amount;

            // Deduct from provider wallet
            provider.wallet.balance = providerBalanceAfter;
            await provider.save({ session });

            // Credit commission to admin wallet
            await AdminWallet.addCommission(commissionAmount, `Commission from ${provider.name}'s withdrawal`);

            // Track total volume
            await AdminWallet.trackVolume(amount);

            // Create withdrawal transaction
            const transactionData = {
                providerId: providerId,
                type: autoApproved ? 'withdrawal_completed' : 'withdrawal_request',
                amount: amount,
                balanceBefore: providerBalanceBefore,
                balanceAfter: providerBalanceAfter,
                commissionAmount: commissionAmount,
                commissionPercentage: commissionRate,
                providerAmount: netAmount,
                withdrawalDetails: {
                    requestedAmount: amount,
                    commissionRate: commissionRate,
                    commissionAmount: commissionAmount,
                    netAmount: netAmount,
                    bankDetails: {
                        accountNumber: provider.documents.bankDetails.accountNumber,
                        ifscCode: provider.documents.bankDetails.ifscCode,
                        bankName: provider.documents.bankDetails.bankName || 'Unknown'
                    },
                    processedAt: autoApproved ? new Date() : null
                },
                description: autoApproved
                    ? `Withdrawal of ₹${netAmount} processed (₹${commissionAmount} commission)`
                    : `Withdrawal request for ₹${netAmount} (₹${commissionAmount} commission) - Pending approval`,
                status: autoApproved ? 'completed' : 'pending',
                paymentMethod: 'bank_transfer',
                currency: 'INR'
            };

            await Transaction.create([transactionData], { session });

            // Create commission transaction for admin tracking
            await Transaction.create([{
                providerId: providerId,
                type: 'commission',
                amount: commissionAmount,
                description: `Platform commission (${commissionRate}%) on ₹${amount} withdrawal`,
                status: 'completed',
                currency: 'INR'
            }], { session });

            await session.commitTransaction();

            console.log(`✅ Withdrawal ${autoApproved ? 'completed' : 'request created'}:`);
            console.log(`   Net amount: ₹${netAmount}`);
            console.log(`   Commission: ₹${commissionAmount}`);

        } catch (withdrawError) {
            await session.abortTransaction();
            console.error('❌ Withdrawal failed, rolled back:', withdrawError.message);
            throw new Error(`Withdrawal failed: ${withdrawError.message}`);
        } finally {
            session.endSession();
        }

        return NextResponse.json({
            success: true,
            message: autoApproved
                ? `Withdrawal successful! ₹${netAmount} will be transferred to your bank within ${processingDays} business days.`
                : `Withdrawal request submitted! ₹${netAmount} will be transferred after admin approval.`,
            withdrawal: {
                requestedAmount: amount,
                commissionRate: commissionRate,
                commissionAmount: commissionAmount,
                netAmount: netAmount,
                newBalance: provider.wallet.balance - amount,
                status: autoApproved ? 'completed' : 'pending',
                autoApproved: autoApproved,
                processingDays: processingDays,
                bankAccount: `****${provider.documents.bankDetails.accountNumber.slice(-4)}`
            }
        });

    } catch (error) {
        console.error('❌ Withdrawal error:', {
            message: error.message,
            stack: error.stack
        });
        return NextResponse.json({
            success: false,
            message: error.message || 'Withdrawal failed'
        }, { status: 500 });
    }
}

/**
 * GET /api/wallet/withdraw
 * 
 * Get withdrawal info - limits, commission rate, bank details status
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

        const provider = await ServiceProvider.findById(providerId);
        if (!provider) {
            return NextResponse.json(
                { success: false, message: 'Provider not found' },
                { status: 404 }
            );
        }

        // Get platform settings
        const settings = await PlatformSettings.getSettings();
        const walletConfig = settings.walletPayment || {};

        const hasBankDetails = !!(
            provider.documents?.bankDetails?.accountNumber &&
            provider.documents?.bankDetails?.ifscCode
        );

        return NextResponse.json({
            success: true,
            data: {
                balance: provider.wallet?.balance || 0,
                hasBankDetails: hasBankDetails,
                bankAccount: hasBankDetails
                    ? `****${provider.documents.bankDetails.accountNumber.slice(-4)}`
                    : null,
                bankName: hasBankDetails
                    ? provider.documents.bankDetails.bankName
                    : null,
                withdrawalConfig: {
                    commissionRate: walletConfig.partnerWithdrawalCommission || 15,
                    minAmount: walletConfig.minWithdrawalAmount || 100,
                    maxAmount: walletConfig.maxWithdrawalAmount || 100000,
                    autoApproveLimit: walletConfig.autoApproveWithdrawalLimit || 1000,
                    processingDays: walletConfig.withdrawalProcessingDays || 3
                }
            }
        });

    } catch (error) {
        console.error('Withdrawal info error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to get withdrawal info'
        }, { status: 500 });
    }
}
