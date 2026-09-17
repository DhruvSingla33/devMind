import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS, AUTH_PROVIDERS } from '../constants/app.constants.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from './jwt.service.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Register user with Email & Password
 */
export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'User with this email address already exists');
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    authProvider: AUTH_PROVIDERS.LOCAL,
  });

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

/**
 * Login user with Email & Password
 */
export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password +refreshToken');
  if (!user) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
  }

  if (user.authProvider === AUTH_PROVIDERS.GOOGLE && !user.password) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'This account was created using Google Sign-In. Please sign in with Google.'
    );
  }

  const isPasswordValid = await user.isPasswordMatch(password);
  if (!isPasswordValid) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
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

/**
 * Google OAuth Login or Register via ID Token
 */
export const googleAuthService = async ({ idToken }) => {
  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID || undefined,
    });
    payload = ticket.getPayload();
  } catch (error) {
    if (process.env.NODE_ENV === 'development' && idToken === 'MOCK_GOOGLE_ID_TOKEN') {
      payload = {
        sub: 'mock_google_123456789',
        email: 'mockuser@example.com',
        name: 'Mock Google User',
        picture: 'https://lh3.googleusercontent.com/a/default-user',
        email_verified: true,
      };
    } else {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid Google ID token');
    }
  }

  if (!payload || !payload.email) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid Google payload: Email missing');
  }

  let user = await User.findOne({
    $or: [{ email: payload.email.toLowerCase() }, { googleId: payload.sub }],
  }).select('+refreshToken');

  if (user) {
    if (!user.googleId) user.googleId = payload.sub;
    if (payload.picture && !user.avatar) user.avatar = payload.picture;
    user.isEmailVerified = payload.email_verified || true;
  } else {
    user = new User({
      name: payload.name || 'Google User',
      email: payload.email.toLowerCase(),
      authProvider: AUTH_PROVIDERS.GOOGLE,
      googleId: payload.sub,
      avatar: payload.picture || '',
      isEmailVerified: payload.email_verified || true,
    });
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

/**
 * Refresh Access Token
 */
export const refreshTokensService = async ({ refreshToken }) => {
  const decoded = verifyRefreshToken(refreshToken);

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== refreshToken) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid or revoked refresh token');
  }

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};
