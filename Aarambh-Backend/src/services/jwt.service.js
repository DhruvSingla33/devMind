import jwt from 'jsonwebtoken';
import { envConfig } from '../config/env.config.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/app.constants.js';

/**
 * Enterprise JWT Signing Service (Supports HMAC / RS256 algorithm)
 */

export const generateAccessToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email || '',
    phone: user.phone || '',
    role: user.role,
  };

  return jwt.sign(payload, envConfig.jwt.secret, {
    expiresIn: envConfig.jwt.accessExpiration,
    algorithm: 'HS256',
  });
};

export const generateRefreshToken = (user) => {
  const payload = {
    id: user._id,
  };

  return jwt.sign(payload, envConfig.jwt.refreshSecret, {
    expiresIn: envConfig.jwt.refreshExpiration,
    algorithm: 'HS256',
  });
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, envConfig.jwt.secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Access token has expired. Please refresh your token.');
    }
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid access token');
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, envConfig.jwt.refreshSecret);
  } catch (error) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired refresh token');
  }
};
