import Joi from 'joi';
import { OTP_PURPOSE } from '../constants/app.constants.js';

export const signupSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Name cannot be empty',
    'string.min': 'Name must be at least 2 characters long',
    'any.required': 'Name is required',
  }),
  email: Joi.string().trim().email().required().messages({
    'string.email': 'Must be a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).max(128).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    'string.email': 'Must be a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

export const sendOtpSchema = Joi.object({
  target: Joi.string().trim().required().messages({
    'any.required': 'Phone number or email address is required',
  }),
  purpose: Joi.string()
    .valid(...Object.values(OTP_PURPOSE))
    .default(OTP_PURPOSE.LOGIN),
});

export const verifyOtpSchema = Joi.object({
  target: Joi.string().trim().required().messages({
    'any.required': 'Phone number or email address is required',
  }),
  otpCode: Joi.string().length(6).required().messages({
    'string.length': 'OTP must be a 6-digit code',
    'any.required': 'OTP code is required',
  }),
  purpose: Joi.string()
    .valid(...Object.values(OTP_PURPOSE))
    .default(OTP_PURPOSE.LOGIN),
  name: Joi.string().trim().allow(''),
});

export const googleAuthSchema = Joi.object({
  idToken: Joi.string().required().messages({
    'any.required': 'Google ID token is required',
  }),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token is required',
  }),
});
