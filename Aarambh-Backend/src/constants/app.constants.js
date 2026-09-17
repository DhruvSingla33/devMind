/**
 * Enterprise Application Constants
 */

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

export const ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
  MENTOR: 'mentor',
};

export const AUTH_PROVIDERS = {
  LOCAL: 'local',
  GOOGLE: 'google',
  PHONE: 'phone',
};

export const OTP_PURPOSE = {
  SIGNUP: 'signup',
  LOGIN: 'login',
  VERIFICATION: 'verification',
  RESET_PASSWORD: 'reset_password',
};

export const CACHE = {
  DEFAULT_TTL_SECONDS: 300, // 5 minutes
  TEXTBOOKS_KEY: 'cache:textbooks:all',
  MENTORS_KEY: 'cache:mentors:all',
  PULSE_KEY: 'cache:pulse:today',
};

export const MESSAGES = {
  SUCCESS: 'Operation completed successfully',
  OTP_SENT: 'OTP sent successfully',
  OTP_VERIFIED: 'OTP verified successfully',
  LOGIN_SUCCESS: 'User logged in successfully',
  SIGNUP_SUCCESS: 'User registered successfully',
  UNAUTHORIZED: 'Unauthorized: Access token is missing or invalid',
  FORBIDDEN: 'Forbidden: Insufficient permissions',
  NOT_FOUND: 'Resource not found',
  DB_UNAVAILABLE: 'Database connection is not established. Please check your MongoDB server.',
};
