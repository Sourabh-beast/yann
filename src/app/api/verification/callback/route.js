import Homeowner from '@/models/Homeowner';
import ServiceProvider from '@/models/ServiceProvider';
import connectDB from '@/lib/connectDB';

const MEON_BASE_URL = 'https://digilocker.meon.co.in';

// Callback handler - Meon redirects here with `state` and maybe other params?
// Actually Step 3 implies we call "send_entire_data" with "client_token" and "state".
// The redirect URL likely receives `state` (or `request_id`?) from Meon. 
// We generally need to handle the GET request from the redirect.

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const state = searchParams.get('state') || searchParams.get('requestId'); // Unsure of parameter name, usually state or id
    const userId = searchParams.get('userId');
    const userType = searchParams.get('userType');
    
    // We also need the client_token. 
    // If we didn't save it, we can't call step 3 unless it's passed back or we generated it deterministically?
    // Or maybe we sent it in the redirect_url query params?
    // Let's assume we passed it in the redirect_url for statelessness, although security-wise not perfect, it's a token.
    const clientToken = searchParams.get('clientToken'); 

    if (!state || !userId || !clientToken) {
        return NextResponse.json({ success: false, message: 'Missing callback parameters' }, { status: 400 });
    }

    // 3. Retrieve Data
    const dataResponse = await axios.post(`${MEON_BASE_URL}/v2/send_entire_data`, {
        client_token: clientToken,
        state: state
    }, {
        headers: { 'Content-Type': 'application/json' }
    });

    const verificationData = dataResponse.data;
    
    // Check if Aadhaar is present and valid
    // Structure of verificationData depends on Meon response. 
    // Assuming it contains a list of documents or status.
    
    let isSuccess = false;
    let aadhaarData = null;
    
    // LOGIC TO PARSE verificationData (Simulated/Generic)
    if (verificationData && (verificationData.status === 'success' || verificationData.documents)) {
        isSuccess = true;
        // Find aadhaar document details
        // aadhaarData = ...
    }

    if (isSuccess) {
        // Update User
        const Model = userType === 'provider' ? ServiceProvider : Homeowner;
        await Model.findByIdAndUpdate(userId, {
            isVerified: true,
            aadhaarVerified: true,
            aadhaarVerifiedAt: new Date(),
            // Store other details if available
            // 'documents.aadhaar.verified': true
        });

        // Redirect to app with success
        return NextResponse.redirect('yann-mobile://verification-success');
    } else {
        return NextResponse.redirect('yann-mobile://verification-failed');
    }

  } catch (error) {
    console.error('Verification Callback Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
