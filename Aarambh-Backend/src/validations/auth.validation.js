import Joi from 'joi';
import { OTP_PURPOSE } from '../constants/app.constants.js';

export const signupSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Name cannot be empty',
    'string.min': 'Name must be at least 2 characters long',
    'any.required': 'Name is required',
  }),
  classLevel: Joi.string().valid('11th', '12th', 'dropper').required().messages({
    'any.only': 'Class must be one of 11th, 12th or Dropper',
    'any.required': 'Class is required',
  }),
  phone: Joi.string().trim().pattern(/^[6-9]\d{9}$/).required().messages({
    'string.pattern.base': 'Must be a valid 10-digit mobile number',
    'any.required': 'Mobile number is required',
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

export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    'any.required': 'Current password is required',
  }),
  newPassword: Joi.string().min(6).max(128).required().messages({
    'string.min': 'New password must be at least 6 characters long',
    'any.required': 'New password is required',
  }),
});

// Profile edit — every field optional, but at least one must be present so an
// empty PATCH is rejected.
export const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).messages({
    'string.min': 'Name must be at least 2 characters long',
  }),
  phone: Joi.string().trim().pattern(/^[6-9]\d{9}$/).messages({
    'string.pattern.base': 'Must be a valid 10-digit mobile number',
  }),
  classLevel: Joi.string().valid('11th', '12th', 'dropper').messages({
    'any.only': 'Class must be one of 11th, 12th or Dropper',
  }),
  targetExam: Joi.string().trim().allow('').max(60),
  targetYear: Joi.number().integer().min(2000).max(2100).allow(null),
  institute: Joi.string().trim().allow('').max(120),
})
  .min(1)
  .messages({ 'object.min': 'Provide at least one field to update' });

export const resetPasswordSchema = Joi.object({
  target: Joi.string().trim().required().messages({
    'any.required': 'Email or mobile number is required',
  }),
  otpCode: Joi.string().length(6).required().messages({
    'string.length': 'OTP must be a 6-digit code',
    'any.required': 'OTP code is required',
  }),
  newPassword: Joi.string().min(6).max(128).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'New password is required',
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
