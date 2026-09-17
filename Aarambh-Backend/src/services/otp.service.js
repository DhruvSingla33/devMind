import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { Otp } from '../models/otp.model.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS, OTP_PURPOSE, AUTH_PROVIDERS } from '../constants/app.constants.js';
import { generateAccessToken, generateRefreshToken } from './jwt.service.js';

// Email Transporter (Nodemailer)
const mailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
});

/**
 * Generate 6-digit numeric OTP
 */
const generate6DigitOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Send real SMS using Twilio, Fast2SMS, MSG91, or Console Fallback
 */
const sendRealSms = async (phoneNumber, otpCode) => {
  const message = `Your Aarambh verification code is ${otpCode}. Valid for 10 minutes. Do not share it with anyone.`;

  // 1. Twilio Integration (If configured in .env)
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const auth = Buffer.from(
        `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
      ).toString('base64');

      const params = new URLSearchParams({
        To: phoneNumber,
        From: process.env.TWILIO_PHONE_NUMBER || '',
        Body: message,
      });

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params,
        }
      );

      const data = await response.json();
      if (!response.ok) {
        console.error('[Twilio Error]:', data.message || data);
      } else {
        console.log(`[Twilio SMS Sent Successfully] to ${phoneNumber}`);
        return true;
      }
    } catch (err) {
      console.error('[Twilio Service Exception]:', err.message);
    }
  }

  // 2. Fast2SMS / MSG91 Integration (If configured in .env)
  if (process.env.FAST2SMS_API_KEY) {
    try {
      const cleanPhone = phoneNumber.replace(/[^0-9]/g, '').slice(-10); // 10-digit Indian phone
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otpCode,
          numbers: cleanPhone,
        }),
      });
      const data = await response.json();
      if (data.return) {
        console.log(`[Fast2SMS Sent Successfully] to ${cleanPhone}`);
        return true;
      }
      console.error('[Fast2SMS Error]:', data.message || data);
    } catch (err) {
      console.error('[Fast2SMS Service Exception]:', err.message);
    }
  }

  // 3. Fallback for Development Mode (Logs OTP to Server Console)
  console.log(`====================================================`);
  console.log(`📱 [SMS OTP GATEWAY LOG]: Phone '${phoneNumber}' => OTP Code: [ ${otpCode} ]`);
  console.log(`   (To send real SMS to mobile, configure TWILIO or FAST2SMS keys in .env)`);
  console.log(`====================================================`);
  return false;
};

/**
 * Send real Email OTP using Nodemailer
 */
const sendRealEmail = async (email, otpCode) => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      await mailTransporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'Aarambh Learning'}" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Your Aarambh Verification OTP Code',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #f4f6f8;">
            <div style="max-width: 500px; margin: 0 auto; background: #ffffff; padding: 24px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #4aa3ff; margin-top: 0;">Aarambh Verification</h2>
              <p style="font-size: 16px; color: #333;">Your 6-digit OTP code for authentication is:</p>
              <div style="text-align: center; margin: 24px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #111; background: #eef5ff; padding: 12px 24px; border-radius: 6px; display: inline-block;">
                  ${otpCode}
                </span>
              </div>
              <p style="font-size: 14px; color: #666;">This code is valid for 10 minutes. Do not share this OTP with anyone.</p>
            </div>
          </div>
        `,
      });
      console.log(`[Email OTP Sent Successfully] to ${email}`);
      return true;
    } catch (err) {
      console.error('[Nodemailer Email Error]:', err.message);
    }
  }

  // Fallback for Development Mode
  console.log(`====================================================`);
  console.log(`📧 [EMAIL OTP LOG]: Target '${email}' => OTP Code: [ ${otpCode} ]`);
  console.log(`   (To send real emails, configure SMTP_USER & SMTP_PASS in .env)`);
  console.log(`====================================================`);
  return false;
};

/**
 * Send OTP Service Endpoint
 */
export const sendOtpService = async ({ target, purpose = OTP_PURPOSE.LOGIN }) => {
  if (!target) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Phone number or email address is required');
  }

  const isEmail = target.includes('@');
  const normalizedTarget = target.trim().toLowerCase();
  const otpCode = generate6DigitOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  // Invalidate any active OTPs for this target
  await Otp.deleteMany({ phoneOrEmail: normalizedTarget, purpose });

  // Store new OTP in MongoDB
  await Otp.create({
    phoneOrEmail: normalizedTarget,
    otpCode,
    purpose,
    expiresAt,
  });

  let delivered = false;
  if (isEmail) {
    delivered = await sendRealEmail(normalizedTarget, otpCode);
  } else {
    delivered = await sendRealSms(normalizedTarget, otpCode);
  }

  return {
    message: delivered
      ? `OTP sent successfully to ${normalizedTarget}`
      : `OTP generated for ${normalizedTarget}. (In dev mode, check server terminal logs for OTP)`,
    expiresInMinutes: 10,
    // Return devOtp in response when running locally for easy testing without SMS gateway
    ...(process.env.NODE_ENV === 'development' && { devOtp: otpCode }),
  };
};

/**
 * Verify OTP Service Endpoint
 */
export const verifyOtpService = async ({ target, otpCode, purpose = OTP_PURPOSE.LOGIN, name }) => {
  if (!target || !otpCode) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Target (phone/email) and OTP code are required');
  }

  const normalizedTarget = target.trim().toLowerCase();
  const isEmail = normalizedTarget.includes('@');

  const otpRecord = await Otp.findOne({
    phoneOrEmail: normalizedTarget,
    otpCode,
    purpose,
    isVerified: false,
  });

  if (!otpRecord) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid or expired OTP code');
  }

  if (new Date() > otpRecord.expiresAt) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'OTP code has expired');
  }

  otpRecord.isVerified = true;
  await otpRecord.save();

  // Find or create user
  const query = isEmail ? { email: normalizedTarget } : { phone: normalizedTarget };
  let user = await User.findOne(query).select('+refreshToken');

  if (!user) {
    user = new User({
      name: name || (isEmail ? normalizedTarget.split('@')[0] : `User_${normalizedTarget.slice(-4)}`),
      ...(isEmail ? { email: normalizedTarget, isEmailVerified: true } : { phone: normalizedTarget, isPhoneVerified: true }),
      authProvider: isEmail ? AUTH_PROVIDERS.LOCAL : AUTH_PROVIDERS.PHONE,
    });
  } else {
    if (isEmail) user.isEmailVerified = true;
    else user.isPhoneVerified = true;
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return {
    user,
    accessToken,
    refreshToken,
  };
};
