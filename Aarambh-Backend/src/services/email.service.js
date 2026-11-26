import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM || 'Aarambh Learning <onboarding@resend.dev>';

const layout = (title, body) => `
  <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #f4f6f8;">
    <div style="max-width: 500px; margin: 0 auto; background: #ffffff; padding: 24px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h2 style="color: #4aa3ff; margin-top: 0;">${title}</h2>
      ${body}
      <p style="font-size: 12px; color: #999; margin-top: 24px;">— Team Aarambh</p>
    </div>
  </div>
`;

const otpBlock = (otpCode) => `
  <div style="text-align: center; margin: 24px 0;">
    <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #111; background: #eef5ff; padding: 12px 24px; border-radius: 6px; display: inline-block;">
      ${otpCode}
    </span>
  </div>
  <p style="font-size: 14px; color: #666;">This code is valid for 10 minutes. Do not share this OTP with anyone.</p>
`;

/**
 * Email templates
 */
export const emailTemplates = {
  otp: (otpCode) => ({
    subject: 'Your Aarambh Verification OTP Code',
    html: layout('Aarambh Verification', `
      <p style="font-size: 16px; color: #333;">Your 6-digit OTP code for authentication is:</p>
      ${otpBlock(otpCode)}
    `),
  }),
  resetPassword: (otpCode) => ({
    subject: 'Reset your Aarambh password',
    html: layout('Password Reset', `
      <p style="font-size: 16px; color: #333;">Use this code to reset your password:</p>
      ${otpBlock(otpCode)}
      <p style="font-size: 14px; color: #666;">If you didn't request this, you can ignore this email.</p>
    `),
  }),
  welcome: (name = 'there') => ({
    subject: 'Welcome to Aarambh!',
    html: layout(`Welcome, ${name}!`, `
      <p style="font-size: 16px; color: #333;">Your account is ready. Start learning today with Aarambh.</p>
    `),
  }),
};

/**
 * Send an email via Resend. Falls back to console logging when RESEND_API_KEY is not set.
 * @returns {Promise<boolean>} true if delivered to the provider
 */
export const sendEmail = async ({ to, subject, html }) => {
  if (!resend) {
    console.log(`📧 [EMAIL LOG] (RESEND_API_KEY not set) To: ${to} | Subject: ${subject}`);
    return false;
  }

  try {
    const { error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) {
      console.error('[Resend Error]:', error.message || error);
      return false;
    }
    console.log(`[Email Sent Successfully] to ${to}`);
    return true;
  } catch (err) {
    console.error('[Resend Service Exception]:', err.message);
    return false;
  }
};
