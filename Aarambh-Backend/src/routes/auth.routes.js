import { Router } from 'express';
import {
  signup,
  login,
  googleAuth,
  sendOtp,
  verifyOtp,
  changePassword,
  resetPassword,
  refreshToken,
  getMe,
  updateProfile,
} from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import {
  signupSchema,
  loginSchema,
  sendOtpSchema,
  verifyOtpSchema,
  changePasswordSchema,
  resetPasswordSchema,
  googleAuthSchema,
  refreshTokenSchema,
  updateProfileSchema,
} from '../validations/auth.validation.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication & profile management (Email/Password, Phone OTP, Google OAuth)
 */

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.post('/google', validate(googleAuthSchema), googleAuth);

/**
 * @swagger
 * /auth/send-otp:
 *   post:
 *     summary: Send 6-digit OTP code via SMS or Email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - target
 *             properties:
 *               target:
 *                 type: string
 *                 description: Phone number (+919876543210) or Email address
 *                 example: "+919876543210"
 *               purpose:
 *                 type: string
 *                 enum: [login, signup, reset_password]
 *                 example: login
 *     responses:
 *       200:
 *         description: OTP sent successfully
 */
router.post('/send-otp', validate(sendOtpSchema), sendOtp);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify 6-digit OTP code and Register/Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - target
 *               - otpCode
 *             properties:
 *               target:
 *                 type: string
 *                 example: "+919876543210"
 *               otpCode:
 *                 type: string
 *                 example: "123456"
 *               purpose:
 *                 type: string
 *                 example: login
 *               name:
 *                 type: string
 *                 example: John Doe
 *     responses:
 *       200:
 *         description: OTP verified, Access and Refresh JWT tokens returned
 */
router.post('/verify-otp', validate(verifyOtpSchema), verifyOtp);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Verify a reset_password OTP and set a new password for an existing account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - target
 *               - otpCode
 *               - newPassword
 *             properties:
 *               target:
 *                 type: string
 *                 example: "you@example.com"
 *               otpCode:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 example: "newSecurePass123"
 *     responses:
 *       200:
 *         description: Password reset successfully
 */
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change password for the signed-in user (requires their current password)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
router.post('/change-password', authenticateJWT, validate(changePasswordSchema), changePassword);

router.post('/refresh-token', validate(refreshTokenSchema), refreshToken);
router.get('/me', authenticateJWT, getMe);
router.patch('/me', authenticateJWT, validate(updateProfileSchema), updateProfile);

export default router;
