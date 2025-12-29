import { NextResponse } from 'next/server';
import axios from 'axios';
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
    
    // Log all received parameters for debugging
    console.log('Callback received URL:', req.url);
    console.log('All params:', Object.fromEntries(searchParams.entries()));
    
    const state = searchParams.get('state') || searchParams.get('requestId');
    const userId = searchParams.get('userId');
    const userType = searchParams.get('userType') || 'homeowner';
    const clientToken = searchParams.get('clientToken'); 

    console.log('Parsed params:', { state, userId, userType, clientToken: clientToken ? 'present' : 'missing' });

    if (!state || !userId || !clientToken) {
        console.error('Missing params:', { state: !!state, userId: !!userId, clientToken: !!clientToken });
        return NextResponse.json({ 
            success: false, 
            message: `Missing callback parameters: state=${!!state}, userId=${!!userId}, clientToken=${!!clientToken}` 
        }, { status: 400 });
    }

    // 3. Retrieve Data from Meon
    console.log('Calling Meon API to retrieve data...');
    const dataResponse = await axios.post(`${MEON_BASE_URL}/v2/send_entire_data`, {
        client_token: clientToken,
        state: state
    }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000 // 30 second timeout
    });

    const verificationData = dataResponse.data;
    console.log('Meon data response:', JSON.stringify(verificationData));
    
    // Check if Aadhaar is present and valid
    // Handle both boolean `status: true` and string `status: 'success'`
    let isSuccess = false;
    
    if (verificationData && (
        verificationData.status === true || 
        verificationData.status === 'success' || 
        verificationData.documents ||
        verificationData.aadhaar
    )) {
        isSuccess = true;
    }

    console.log('Verification success:', isSuccess);

    if (isSuccess) {
        // Update User
        const Model = userType === 'provider' ? ServiceProvider : Homeowner;
        await Model.findByIdAndUpdate(userId, {
            isVerified: true,
            aadhaarVerified: true,
            aadhaarVerifiedAt: new Date(),
        });
        console.log('User updated successfully');

        // Redirect to app with success - use a web page that shows success
        // Since deep links may not work in browser context, show a success page
        return new NextResponse(`
            <html>
                <head><title>Verification Successful</title></head>
                <body style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #10B981;">
                    <div style="text-align: center; color: white;">
                        <h1>✅ Verification Successful!</h1>
                        <p>Your Aadhaar has been verified. You can close this window and return to the app.</p>
                        <a href="yann://verification-success" style="color: white;">Open App</a>
                    </div>
                </body>
            </html>
        `, { headers: { 'Content-Type': 'text/html' } });
    } else {
        return new NextResponse(`
            <html>
                <head><title>Verification Failed</title></head>
                <body style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #EF4444;">
                    <div style="text-align: center; color: white;">
                        <h1>❌ Verification Failed</h1>
                        <p>Could not verify your Aadhaar. Please try again.</p>
                        <a href="yann://verification-failed" style="color: white;">Open App</a>
                    </div>
                </body>
            </html>
        `, { headers: { 'Content-Type': 'text/html' } });
    }

  } catch (error) {
    console.error('Verification Callback Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
