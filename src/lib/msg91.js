/**
 * MSG91 OTP Service Integration
 * Handles sending and verifying OTPs via MSG91 API
 */

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID;
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID || 'SFSHUT';
const MSG91_DLT_TE_ID = process.env.MSG91_DLT_TE_ID || '1207171396945691944';
const MSG91_PE_ID = process.env.MSG91_PE_ID || '1201163853452568887';
const MSG91_BASE_URL = 'https://control.msg91.com/api/v5';

/**
 * Format phone number to MSG91 format (91XXXXXXXXXX)
 * @param {string} phone - Phone number (can be with or without country code)
 * @returns {string} - Formatted phone number with 91 prefix
 */
export function formatPhoneNumber(phone) {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.toString().replace(/\D/g, '');
  
  // If already has 91 prefix and is 12 digits, return as is
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return cleaned;
  }
  
  // Get last 10 digits (the actual phone number)
  const last10 = cleaned.slice(-10);
  
  // Return with 91 prefix
  return `91${last10}`;
}

/**
 * Check if a string is a valid Indian phone number
 * @param {string} value - The value to check
 * @returns {boolean} - True if valid phone number
 */
export function isPhoneNumber(value) {
  if (!value) return false;
  const cleaned = value.toString().replace(/\D/g, '');
  // Check for 10 digit number starting with 6-9 (Indian mobile)
  // Or 12 digit with 91 prefix
  const phoneRegex = /^(91)?[6-9]\d{9}$/;
  return phoneRegex.test(cleaned);
}

/**
 * Check if a string is a valid email
 * @param {string} value - The value to check
 * @returns {boolean} - True if valid email
 */
export function isEmail(value) {
  if (!value) return false;
  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/;
  return emailRegex.test(value.trim().toLowerCase());
}

/**
 * Detect if input is email or phone
 * @param {string} input - User input (email or phone)
 * @returns {'email' | 'phone' | null} - Type of input
 */
export function detectInputType(input) {
  if (!input) return null;
  
  const trimmed = input.trim();
  
  if (isEmail(trimmed)) {
    return 'email';
  }
  
  if (isPhoneNumber(trimmed)) {
    return 'phone';
  }
  
  return null;
}

/**
 * Send OTP via MSG91
 * @param {string} phone - Phone number (10 digits or with 91 prefix)
 * @returns {Promise<{success: boolean, message: string, requestId?: string}>}
 */
export async function sendOTPViaMSG91(phone) {
  try {
    if (!MSG91_AUTH_KEY) {
      console.error('MSG91_AUTH_KEY not configured');
      return { success: false, message: 'SMS service not configured' };
    }
    
    if (!MSG91_TEMPLATE_ID) {
      console.error('MSG91_TEMPLATE_ID not configured');
      return { success: false, message: 'SMS template not configured' };
    }
    
    const formattedPhone = formatPhoneNumber(phone);
    
    if (!formattedPhone || formattedPhone.length !== 12) {
      return { success: false, message: 'Invalid phone number' };
    }
    
    console.log(`Sending OTP to: ${formattedPhone}`);
    
    // Build query params for GET request (more reliable with MSG91)
    const params = new URLSearchParams({
      template_id: MSG91_TEMPLATE_ID,
      mobile: formattedPhone,
      authkey: MSG91_AUTH_KEY,
      otp_length: '6',
      otp_expiry: '10',
    });
    
    // Add DLT params
    if (MSG91_DLT_TE_ID) params.append('DLT_TE_ID', MSG91_DLT_TE_ID);
    if (MSG91_PE_ID) params.append('PE_ID', MSG91_PE_ID);
    if (MSG91_SENDER_ID) params.append('sender_id', MSG91_SENDER_ID);
    
    const url = `${MSG91_BASE_URL}/otp?${params.toString()}`;
    console.log('MSG91 Request URL:', url.replace(MSG91_AUTH_KEY, '***'));
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    const data = await response.json();
    console.log('MSG91 Send OTP Response:', data);
    
    if (data.type === 'success') {
      return { 
        success: true, 
        message: 'OTP sent successfully',
        requestId: data.request_id 
      };
    } else {
      console.error('MSG91 Send OTP Error:', data);
      
      // Handle specific error messages
      if (data.message?.includes('IP') || data.message?.includes('whitelist')) {
        return { 
          success: false, 
          message: 'Server configuration error. Please contact support.' 
        };
      }
      
      return { 
        success: false, 
        message: data.message || 'Failed to send OTP' 
      };
    }
  } catch (error) {
    console.error('MSG91 Send OTP Exception:', error);
    return { success: false, message: 'Failed to send OTP. Please try again.' };
  }
}

/**
 * Retry OTP via Voice Call (MSG91 will call the user and speak the OTP)
 * @param {string} phone - Phone number (10 digits or with 91 prefix)
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function retryOTPViaVoice(phone) {
  try {
    if (!MSG91_AUTH_KEY) {
      console.error('MSG91_AUTH_KEY not configured');
      return { success: false, message: 'Voice service not configured' };
    }
    
    const formattedPhone = formatPhoneNumber(phone);
    
    if (!formattedPhone || formattedPhone.length !== 12) {
      return { success: false, message: 'Invalid phone number' };
    }
    
    console.log(`Sending Voice OTP to: ${formattedPhone}`);
    
    // MSG91 retry API with retrytype=voice
    const params = new URLSearchParams({
      authkey: MSG91_AUTH_KEY,
      retrytype: 'voice',
      mobile: formattedPhone,
    });
    
    const url = `${MSG91_BASE_URL}/otp/retry?${params.toString()}`;
    console.log('MSG91 Voice OTP Request URL:', url.replace(MSG91_AUTH_KEY, '***'));
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    const data = await response.json();
    console.log('MSG91 Voice OTP Response:', data);
    
    if (data.type === 'success') {
      return { 
        success: true, 
        message: 'You will receive a call shortly with your OTP',
      };
    } else {
      console.error('MSG91 Voice OTP Error:', data);
      
      if (data.message?.includes('already verified')) {
        return { success: false, message: 'OTP already verified' };
      }
      
      if (data.message?.includes('retries exceeded') || data.message?.includes('max')) {
        return { success: false, message: 'Maximum retry attempts reached. Please try again later.' };
      }
      
      return { 
        success: false, 
        message: data.message || 'Failed to initiate voice call' 
      };
    }
  } catch (error) {
    console.error('MSG91 Voice OTP Exception:', error);
    return { success: false, message: 'Failed to initiate voice call. Please try again.' };
  }
}

/**
 * Verify OTP via MSG91
 * @param {string} phone - Phone number (10 digits or with 91 prefix)
 * @param {string} otp - OTP code entered by user
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function verifyOTPViaMSG91(phone, otp) {
  try {
    if (!MSG91_AUTH_KEY) {
      console.error('MSG91_AUTH_KEY not configured');
      return { success: false, message: 'SMS service not configured' };
    }
    
    const formattedPhone = formatPhoneNumber(phone);
    
    if (!formattedPhone || formattedPhone.length !== 12) {
      return { success: false, message: 'Invalid phone number' };
    }
    
    if (!otp || otp.length < 4) {
      return { success: false, message: 'Invalid OTP' };
    }
    
    console.log(`Verifying OTP for: ${formattedPhone}`);
    
    // Use POST with query params as MSG91 expects
    const response = await fetch(
      `${MSG91_BASE_URL}/otp/verify?mobile=${formattedPhone}&otp=${otp}`,
      {
        method: 'POST',
        headers: {
          'authkey': MSG91_AUTH_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );
    
    const data = await response.json();
    console.log('MSG91 Verify OTP Response:', data);
    
    if (data.type === 'success') {
      return { success: true, message: 'OTP verified successfully' };
    } else {
      console.error('MSG91 Verify OTP Error:', data);
      
      // Handle specific error messages
      if (data.message?.includes('IP') || data.message?.includes('whitelist')) {
        return { 
          success: false, 
          message: 'Server configuration error. Please contact support.' 
        };
      }
      
      if (data.message?.includes('expired')) {
        return { success: false, message: 'OTP has expired. Please request a new one.' };
      }
      
      if (data.message?.includes('invalid') || data.message?.includes('not match')) {
        return { success: false, message: 'Invalid OTP. Please try again.' };
      }
      
      return { 
        success: false, 
        message: data.message || 'Invalid OTP' 
      };
    }
  } catch (error) {
    console.error('MSG91 Verify OTP Exception:', error);
    return { success: false, message: 'Failed to verify OTP. Please try again.' };
  }
}

/**
 * Resend OTP via MSG91
 * @param {string} phone - Phone number (10 digits or with 91 prefix)
 * @param {'text' | 'voice'} retryType - Type of retry (SMS or Voice call)
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function resendOTPViaMSG91(phone, retryType = 'text') {
  try {
    if (!MSG91_AUTH_KEY) {
      console.error('MSG91_AUTH_KEY not configured');
      return { success: false, message: 'SMS service not configured' };
    }
    
    const formattedPhone = formatPhoneNumber(phone);
    
    if (!formattedPhone || formattedPhone.length !== 12) {
      return { success: false, message: 'Invalid phone number' };
    }
    
    const response = await fetch(
      `${MSG91_BASE_URL}/otp/retry?mobile=${formattedPhone}&retrytype=${retryType}`,
      {
        method: 'POST',
        headers: {
          'authkey': MSG91_AUTH_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );
    
    const data = await response.json();
    console.log('MSG91 Resend OTP Response:', data);
    
    if (data.type === 'success') {
      return { success: true, message: 'OTP resent successfully' };
    } else {
      console.error('MSG91 Resend OTP Error:', data);
      return { 
        success: false, 
        message: data.message || 'Failed to resend OTP' 
      };
    }
  } catch (error) {
    console.error('MSG91 Resend OTP Exception:', error);
    return { success: false, message: 'Failed to resend OTP' };
  }
}

export default {
  sendOTPViaMSG91,
  verifyOTPViaMSG91,
  resendOTPViaMSG91,
  formatPhoneNumber,
  isPhoneNumber,
  isEmail,
  detectInputType,
};
