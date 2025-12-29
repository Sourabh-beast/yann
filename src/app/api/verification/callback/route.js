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

        // Return success page with proper encoding and auto-redirect attempt
        return new NextResponse(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Successful</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            padding: 20px;
        }
        .container {
            text-align: center;
            color: white;
            max-width: 400px;
        }
        .icon {
            font-size: 80px;
            margin-bottom: 20px;
            animation: bounce 0.6s ease-in-out;
        }
        @keyframes bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
        }
        h1 {
            font-size: 28px;
            margin-bottom: 16px;
            font-weight: 600;
        }
        p {
            font-size: 16px;
            opacity: 0.9;
            margin-bottom: 24px;
            line-height: 1.5;
        }
        .btn {
            display: inline-block;
            background: white;
            color: #059669;
            padding: 14px 32px;
            border-radius: 30px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }
        .note {
            margin-top: 24px;
            font-size: 14px;
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">&#10004;</div>
        <h1>Verification Successful!</h1>
        <p>Your Aadhaar has been verified successfully. Your account is now verified.</p>
        <a href="yann://verification-success" class="btn" id="openApp">Return to App</a>
        <p class="note">If the button doesn't work, please close this window and refresh the app.</p>
    </div>
    <script>
        // Try to open the app automatically after a short delay
        setTimeout(function() {
            window.location.href = 'yann://verification-success';
        }, 1500);
    </script>
</body>
</html>
        `, { 
            headers: { 
                'Content-Type': 'text/html; charset=utf-8' 
            } 
        });
    } else {
        return new NextResponse(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Failed</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
            padding: 20px;
        }
        .container {
            text-align: center;
            color: white;
            max-width: 400px;
        }
        .icon {
            font-size: 80px;
            margin-bottom: 20px;
        }
        h1 {
            font-size: 28px;
            margin-bottom: 16px;
            font-weight: 600;
        }
        p {
            font-size: 16px;
            opacity: 0.9;
            margin-bottom: 24px;
            line-height: 1.5;
        }
        .btn {
            display: inline-block;
            background: white;
            color: #DC2626;
            padding: 14px 32px;
            border-radius: 30px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .note {
            margin-top: 24px;
            font-size: 14px;
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">&#10060;</div>
        <h1>Verification Failed</h1>
        <p>We couldn't verify your Aadhaar. Please try again from the app.</p>
        <a href="yann://verification-failed" class="btn">Return to App</a>
        <p class="note">If the button doesn't work, please close this window and try again.</p>
    </div>
</body>
</html>
        `, { 
            headers: { 
                'Content-Type': 'text/html; charset=utf-8' 
            } 
        });
    }

  } catch (error) {
    console.error('Verification Callback Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
