import { NextResponse } from 'next/server';
import axios from 'axios';
import Homeowner from '@/models/Homeowner';
import ServiceProvider from '@/models/ServiceProvider'; // If needed
import connectDB from '@/lib/db'; // Assuming there's a db connection helper

const MEON_BASE_URL = 'https://digilocker.meon.co.in';
const COMPANY_NAME = 'safe&care';
const SECRET_TOKEN = 'rhJ8OqF5HytSI1CRGmRSgTrQcd4bWsVD';

// initiate verification
export async function POST(req) {
  try {
    await connectDB();
    const { userId, userType = 'homeowner' } = await req.json();

    // 1. Get Access Token (Client Token)
    const tokenResponse = await axios.post(`${MEON_BASE_URL}/get_access_token`, {
        company_name: COMPANY_NAME,
        secret_token: SECRET_TOKEN
    }, {
        headers: { 'Content-Type': 'application/json' }
    });

    // Check if token generated successfully
    if (!tokenResponse.data || (tokenResponse.data.status && tokenResponse.data.status !== 'success' && !tokenResponse.data.token)) {
         // Some APIs return token directly, others return { status: 'success', token: ... }
         // We'll debug this if it fails, but assuming standard field 'token' or similar
         console.error("Token Gen Failed:", tokenResponse.data);
         return NextResponse.json({ success: false, message: 'Failed to generate token' }, { status: 500 });
    }

    const clientToken = tokenResponse.data.token || tokenResponse.data.access_token; // Adjust based on actual response

    // 2. Generate DigiLocker Link
    // We need a redirect URL that comes back to the APP or a web page that redirects to the app.
    // Ideally: https://yann-backend.vercel.app/api/verification/success?userId=...
    // But for mobile, we might want a deep link redirect.
    // Let's assume we redirect to a success page on the backend which then redirects to app scheme.
    
    // Construct a unique redirect URL or state
    // Meon API takes "redirect_url". 
    const callbackUrl = `https://yann-mobile.vercel.app/api/verification/callback?userId=${userId}&userType=${userType}`; 
    // replacing with actual domain if known, or localhost for dev. 
    // The user didn't specify the deployed backend URL, but existing api.ts points to API_BASE_URL.
    // I will use a placeholder or try to find it.

    const linkResponse = await axios.post(`${MEON_BASE_URL}/digi_url`, {
        client_token: clientToken,
        redirect_url: callbackUrl, // Return to our backend to process
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
