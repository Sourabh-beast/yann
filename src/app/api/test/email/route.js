import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

/**
 * POST /api/test/email
 * Test email sending to debug OTP issues
 */
export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Check environment variables
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    console.log('EMAIL_USER:', emailUser ? 'Set ✓' : 'Missing ✗');
    console.log('EMAIL_PASS:', emailPass ? 'Set ✓' : 'Missing ✗');
    console.log('EMAIL_PASS length:', emailPass?.length || 0);
    console.log('EMAIL_PASS has spaces:', emailPass?.includes(' ') ? 'YES ⚠️' : 'NO ✓');

    if (!emailUser || !emailPass) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email credentials not configured',
          debug: {
            emailUser: !!emailUser,
            emailPass: !!emailPass
          }
        },
        { status: 500 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    // Test email
    const testOTP = '123456';
    const info = await transporter.sendMail({
      from: `YANN Test <${emailUser}>`,
      to: email,
      subject: 'Test Email - YANN OTP Debug',
      text: `This is a test email. Your test OTP is: ${testOTP}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Test Email</h2>
          <p>This is a test email from YANN backend.</p>
          <p>Your test OTP is: <strong>${testOTP}</strong></p>
          <p>If you received this, email sending is working correctly!</p>
        </div>
      `,
    });

    console.log('Email sent successfully:', info.messageId);

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      messageId: info.messageId,
      debug: {
        emailUser,
        emailPassLength: emailPass.length,
        hasSpaces: emailPass.includes(' ')
      }
    });

  } catch (error) {
    console.error('Email test error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to send test email',
        error: error.message,
        errorCode: error.code,
        errorCommand: error.command
      },
      { status: 500 }
    );
  }
}
