import { NextResponse } from 'next/server';
import axios from 'axios';
import Homeowner from '@/models/Homeowner';
import ServiceProvider from '@/models/ServiceProvider'; // If needed
import connectDB from '@/lib/connectDB'; // Assuming there's a db connection helper

const MEON_BASE_URL = 'https://digilocker.meon.co.in';
const COMPANY_NAME = 'safe&care';
const SECRET_TOKEN = 'rhJ8OqF5HytSI1CRGmRSgTrQcd4bWsVD';
const DEFAULT_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://yann-care.vercel.app';

// initiate verification
export async function POST(req) {
  try {
    await connectDB();
    const { userId, userType = 'homeowner', returnUrl } = await req.json();

    // 1. Get Access Token (Client Token)
    const tokenResponse = await axios.post(`${MEON_BASE_URL}/get_access_token`, {
        company_name: COMPANY_NAME,
        secret_token: SECRET_TOKEN
    }, {
        headers: { 'Content-Type': 'application/json' }
    });

    // Check if token generated successfully
    // Meon API returns: { "client_token": "...", "state": "...", "status": true }
    if (!tokenResponse.data || (tokenResponse.data.status !== true && tokenResponse.data.status !== 'success')) {
         console.error("Token Gen Failed:", tokenResponse.data);
         return NextResponse.json({ 
             success: false, 
             message: `Failed to generate token: ${JSON.stringify(tokenResponse.data)}` 
         }, { status: 500 });
    }

    const clientToken = tokenResponse.data.client_token || tokenResponse.data.token;
    const state = tokenResponse.data.state;

    // 2. Generate DigiLocker Link
    // We need a redirect URL that comes back to the APP or a web page that redirects to the app.
    // Ideally: https://yann-backend.vercel.app/api/verification/success?userId=...
    // But for mobile, we might want a deep link redirect.
    // Let's assume we redirect to a success page on the backend which then redirects to app scheme.
    
    // Construct a unique redirect URL or state
    // Meon API takes "redirect_url".
    // Derive the callback's base from this request's own origin instead of
    // NEXT_PUBLIC_APP_URL - that env var can point somewhere other than this
    // deployment (e.g. a marketing domain), in which case DigiLocker's
    // callback never reaches this API at all and aadhaarVerified never gets
    // set. Using the request's own origin is self-correcting: it always
    // matches wherever this route is actually running.
    const requestOrigin = new URL(req.url).origin;
        const callbackUrl = new URL('/api/verification/callback', requestOrigin);
        callbackUrl.searchParams.set('userId', userId);
        callbackUrl.searchParams.set('userType', userType);
        callbackUrl.searchParams.set('clientToken', clientToken);
        callbackUrl.searchParams.set('state', state);
        if (returnUrl) {
            callbackUrl.searchParams.set('returnUrl', returnUrl);
        }
    // replacing with actual domain if known, or localhost for dev. 
    // The user didn't specify the deployed backend URL, but existing api.ts points to API_BASE_URL.
    // I will use a placeholder or try to find it.

    const linkResponse = await axios.post(`${MEON_BASE_URL}/digi_url`, {
        client_token: clientToken,
        redirect_url: callbackUrl.toString(), // Return to our backend to process
        company_name: COMPANY_NAME,
        documents: "aadhaar", // We only need aadhaar? User said "aadhaar verification". Prompt says "aadhaar,pan" in example. I will stick to aadhaar first.
        // pan_name/pan_no are optional filtering? The example provided them. 
        // If we don't have them, we omit them.
    }, {
        headers: { 'Content-Type': 'application/json' }
    });

    if (!linkResponse.data || !linkResponse.data.url) {
        console.error("Link Gen Failed:", linkResponse.data);
        return NextResponse.json({ success: false, message: 'Failed to generate verification link' }, { status: 500 });
    }
    
    // We should save the clientToken if we need it later for retrieval?
    // Step 3 says "Retrieving Data... data: { client_token, state }"
    // So we need client_token provided to Step 2.
    
    // Save client_token to user record temporarily? Or pass it in state?
    // Meon might handle state persistence.
    
    return NextResponse.json({ 
        success: true, 
        url: linkResponse.data.url, 
        clientToken: clientToken 
    });

  } catch (error) {
    console.error('Verification Init Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
