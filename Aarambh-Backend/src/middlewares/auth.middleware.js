import { verifyAccessToken } from '../services/jwt.service.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HTTP_STATUS, MESSAGES } from '../constants/app.constants.js';

/**
 * Authentication Middleware - Verifies Bearer JWT Access Token
 * Guards endpoints: Unauthenticated users are rejected with HTTP 401 Unauthorized
 */
export const authenticateJWT = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, MESSAGES.UNAUTHORIZED);
  }

  const decoded = verifyAccessToken(token);

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Unauthorized: User account no longer exists');
  }

  req.user = user;
  next();
});

/**
 * Authorization Guard Middleware - Verifies User Role (RBAC)
 * @param  {...string} roles - Allowed user roles ('student', 'admin', 'mentor')
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, MESSAGES.UNAUTHORIZED));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          HTTP_STATUS.FORBIDDEN,
          `Forbidden: Role '${req.user.role}' is not authorized to access this resource`
        )
      );
    }
    next();
  };
};
