import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/ApiError.js';

/**
 * Global API Rate Limiter — Max 100 requests per minute
 */
export const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req, res, next) => {
    next(new ApiError(429, 'Too many requests from this IP. Please try again after 1 minute.'));
  },
});

/**
 * Strict Auth Rate Limiter — Max 10 attempts per 15 minutes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 10, // Limit each IP to 10 auth attempts
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(
      new ApiError(
        429,
        'Too many login/signup attempts from this IP. Please try again after 15 minutes.'
      )
    );
  },
});
