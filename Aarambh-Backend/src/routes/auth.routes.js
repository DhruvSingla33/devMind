import { Router } from 'express';
import {
  signup,
  login,
  googleAuth,
  sendOtp,
  verifyOtp,
  refreshToken,
  getMe,
} from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import {
  signupSchema,
  loginSchema,
  sendOtpSchema,
  verifyOtpSchema,
  googleAuthSchema,
  refreshTokenSchema,
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

router.post('/refresh-token', validate(refreshTokenSchema), refreshToken);
router.get('/me', authenticateJWT, getMe);

export default router;
