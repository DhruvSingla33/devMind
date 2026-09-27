import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/responseMapper.js';
import { HTTP_STATUS, MESSAGES } from '../constants/app.constants.js';
import {
  registerUser,
  loginUser,
  googleAuthService,
  changePasswordService,
  refreshTokensService,
} from '../services/auth.service.js';
import { sendOtpService, verifyOtpService, resetPasswordService } from '../services/otp.service.js';

export const signup = asyncHandler(async (req, res) => {
  const result = await registerUser(req.body);
  sendCreated(res, result, MESSAGES.SIGNUP_SUCCESS);
});

export const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body);
  sendSuccess(res, HTTP_STATUS.OK, result, MESSAGES.LOGIN_SUCCESS);
});

export const googleAuth = asyncHandler(async (req, res) => {
  const result = await googleAuthService(req.body);
  sendSuccess(res, HTTP_STATUS.OK, result, 'Google authentication successful');
});

export const sendOtp = asyncHandler(async (req, res) => {
  const result = await sendOtpService(req.body);
  sendSuccess(res, HTTP_STATUS.OK, result, MESSAGES.OTP_SENT);
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const result = await verifyOtpService(req.body);
  sendSuccess(res, HTTP_STATUS.OK, result, MESSAGES.OTP_VERIFIED);
});

export const changePassword = asyncHandler(async (req, res) => {
  const result = await changePasswordService({ userId: req.user._id, ...req.body });
  sendSuccess(res, HTTP_STATUS.OK, result, 'Password changed successfully');
});

export const resetPassword = asyncHandler(async (req, res) => {
  const result = await resetPasswordService(req.body);
  sendSuccess(res, HTTP_STATUS.OK, result, 'Password reset successful');
});

export const refreshToken = asyncHandler(async (req, res) => {
  const result = await refreshTokensService(req.body);
  sendSuccess(res, HTTP_STATUS.OK, result, 'Tokens refreshed successfully');
});

export const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, HTTP_STATUS.OK, { user: req.user }, 'Current user profile fetched successfully');
});
