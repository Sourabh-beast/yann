import { NextResponse } from 'next/server';
import Homeowner from '@/models/Homeowner';
import ServiceProvider from '@/models/ServiceProvider';
import connectDB from '@/lib/connectDB';

const DATA_URL_PATTERN = /^data:(image\/(png|jpeg|jpg|webp));base64,/i;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB per document

/**
 * POST /api/identity/submit-documents
 * Submit identity documents for verification (Foreigners/NRI)
 *
 * Request body (JSON):
 * {
 *   userId: string,
 *   userType: 'homeowner' | 'provider',
 *   identityType: 'foreigner' | 'nri',
 *   documents: { [docType]: "data:image/jpeg;base64,..." }
 * }
 */
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { userId, userType, identityType, documents } = body;

    if (!userId || !userType || !identityType || !documents) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('📤 Received identity document submission:', { userId, userType, identityType });

    const Model = userType === 'homeowner' ? Homeowner : ServiceProvider;
    const user = await Model.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Validate and process each base64 document
    const uploadedDocuments = [];
    for (const [docType, dataUrl] of Object.entries(documents)) {
      if (typeof dataUrl !== 'string') continue;

      const match = dataUrl.match(DATA_URL_PATTERN);
      if (!match) {
        return NextResponse.json(
          { success: false, message: `Invalid image format for document: ${docType}` },
          { status: 400 }
        );
      }

      // Check size (base64 is ~33% larger than binary)
      const base64Data = dataUrl.replace(DATA_URL_PATTERN, '');
      const approxBytes = (base64Data.length * 3) / 4;
      if (approxBytes > MAX_IMAGE_BYTES) {
        return NextResponse.json(
          { success: false, message: `Document ${docType} exceeds 5MB size limit` },
          { status: 400 }
        );
      }

      uploadedDocuments.push({
        documentType: docType,
        documentUrl: dataUrl, // Store base64 directly in MongoDB (same as avatar)
        uploadedAt: new Date(),
      });

      console.log(`✅ Processed document: ${docType}`);
    }

    if (uploadedDocuments.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid documents provided' },
        { status: 400 }
      );
    }

    const updatedUser = await Model.findByIdAndUpdate(
      userId,
      {
        $set: {
          identityType,
          identityDocuments: uploadedDocuments,
          identityVerificationStatus: 'pending',
          identitySubmittedAt: new Date(),
        },
      },
      { new: true }
    );

    console.log(`✅ Identity documents submitted for ${userType}: ${user.name}`);

    return NextResponse.json({
      success: true,
      message: 'Documents submitted successfully. You will be notified once reviewed.',
      data: {
        user: {
          id: updatedUser._id,
          identityType: updatedUser.identityType,
          identityVerificationStatus: updatedUser.identityVerificationStatus,
          identitySubmittedAt: updatedUser.identitySubmittedAt,
        },
      },
    });

  } catch (error) {
    console.error('❌ Error submitting identity documents:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
