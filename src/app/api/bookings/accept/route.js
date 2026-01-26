import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Booking from '@/models/Booking';
import ServiceProvider from '@/models/ServiceProvider';
import ResidentRequest from '@/models/ResidentRequest';
import Homeowner from '@/models/Homeowner';
import Transaction from '@/models/Transaction';
import { createAndSendNotification } from '@/lib/notificationHelper';

export async function POST(request) {
  try {
    await connectDB();

    const { bookingId, providerId, providerName } = await request.json();

    if (!bookingId || !providerId) {
      return NextResponse.json(
        { success: false, message: 'Booking ID and Provider ID are required' },
        { status: 400 }
      );
    }

    // Find the booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if already accepted by someone
    if (booking.status === 'accepted') {
      return NextResponse.json(
        { success: false, message: 'This booking has already been accepted by another provider' },
        { status: 400 }
      );
    }

    // Verify provider exists and offers this service
    const provider = await ServiceProvider.findById(providerId);

    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      );
    }

    if (!provider.services.includes(booking.serviceName)) {
      return NextResponse.json(
        { success: false, message: 'Provider does not offer this service' },
        { status: 400 }
      );
    }

    // Update booking
    booking.status = 'accepted';
    booking.assignedProvider = providerId;
    booking.providerName = providerName || provider.name;

    if (booking.negotiation && booking.negotiation.isActive) {
      booking.negotiation.isActive = false;
      booking.negotiation.status = 'accepted';
      booking.negotiation.respondedAt = new Date();
    }

    // Add to provider responses
    booking.providerResponses.push({
      providerId: providerId,
      response: 'accepted',
      respondedAt: new Date()
    });

    await booking.save();

    // 💰 ESCROW TRANSFER: Handle wallet payments based on staging
    if (booking.paymentMethod === 'wallet') {
      // Initialize provider wallet if not exists
      if (!provider.wallet) {
        provider.wallet = { balance: 0, currency: 'INR' };
      }

      const providerBalanceBefore = provider.wallet.balance || 0;

      // NEW: Check for staged payment (25% escrow)
      if (booking.walletPaymentStage === 'initial_25_held') {
        // Release 25% escrow to provider
        const releaseAmount = booking.escrowDetails?.initialAmount || booking.totalPrice * 0.25;

        // Add to provider's wallet
        provider.wallet.balance = providerBalanceBefore + releaseAmount;
        await provider.save();

        // Update booking escrow status
        booking.walletPaymentStage = 'initial_25_released';
        booking.escrowDetails.initialReleasedAt = new Date();
        await booking.save();

        // Create escrow_release transaction for provider
        await Transaction.create({
          bookingId: bookingId,
          providerId: providerId,
          type: 'escrow_release',
          amount: releaseAmount,
          balanceBefore: providerBalanceBefore,
          balanceAfter: provider.wallet.balance,
          escrowStatus: 'released',
          paymentStage: 'initial_25',
          description: `25% booking deposit released (₹${releaseAmount}) - ${booking.serviceName}`,
          status: 'completed',
          paymentMethod: 'wallet',
          currency: 'INR',
          serviceName: booking.serviceName,
          serviceCategory: booking.serviceCategory
        });

        console.log(`💰 ESCROW RELEASED (25%): Transferred ₹${releaseAmount} to provider ${provider.name}'s wallet`);
        console.log(`💡 Remaining 75% (₹${booking.escrowDetails?.completionAmount}) will be paid after job completion`);
      }
      // LEGACY: Handle old full-amount escrow bookings (backward compatibility)
      else if (booking.paymentStatus === 'paid' && !booking.walletPaymentStage) {
        const transferAmount = booking.totalPrice;

        // Add to provider's wallet
        provider.wallet.balance = providerBalanceBefore + transferAmount;
        await provider.save();

        // Create wallet_credit transaction for provider
        await Transaction.create({
          bookingId: bookingId,
          providerId: providerId,
          type: 'wallet_credit',
          amount: transferAmount,
          balanceBefore: providerBalanceBefore,
          balanceAfter: provider.wallet.balance,
          description: `Earnings from booking #${bookingId}: ${booking.serviceName}`,
          status: 'completed',
          paymentMethod: 'wallet',
          currency: 'INR',
          serviceName: booking.serviceName,
          serviceCategory: booking.serviceCategory
        });

        console.log(`💰 ESCROW RELEASED (LEGACY): Transferred ₹${transferAmount} to provider ${provider.name}'s wallet`);
      }
    }

    if (booking.residentRequest) {
      const requestUpdate = {
        status: 'accepted',
        scheduledFor: booking.bookingDate
      };

      if (booking.negotiation) {
        requestUpdate.negotiation = {
          ...booking.negotiation,
          providerId: booking.negotiation.providerId,
          providerName: booking.negotiation.providerName,
          proposedAmount: booking.negotiation.proposedAmount,
          isActive: false,
          status: booking.negotiation.status,
          updatedAt: new Date()
        };
      }

      await ResidentRequest.findByIdAndUpdate(booking.residentRequest, { $set: requestUpdate });
    }

    // Send persistent notification to member
    const homeowner = await Homeowner.findById(booking.customerId);
    if (homeowner) {
      await createAndSendNotification({
        title: '✅ Booking Accepted!',
        message: `${providerName} has accepted your ${booking.serviceName} booking. They will contact you soon.`,
        recipientId: booking.customerId.toString(),
        recipientType: 'homeowner',
        pushToken: homeowner.pushToken,
        type: 'booking_accepted',
        data: {
          type: 'booking_accepted',
          bookingId: booking._id.toString()
        },
        bookingId: booking._id.toString()
      });
    }

    console.log(`✅ Booking ${bookingId} accepted by ${providerName}`);

    return NextResponse.json({
      success: true,
      message: 'Booking accepted successfully!',
      booking: {
        id: booking._id,
        serviceName: booking.serviceName,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        customerAddress: booking.customerAddress,
        bookingDate: booking.formattedDate,
        bookingTime: booking.bookingTime,
        totalPrice: booking.totalPrice,
        status: booking.status
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Booking acceptance error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to accept booking',
        error: error.message
      },
      { status: 500 }
    );
  }
}






// Gitaidahdjand