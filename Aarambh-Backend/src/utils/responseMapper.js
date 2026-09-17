import { ApiResponse } from './ApiResponse.js';
import { ApiError } from './ApiError.js';
import { HTTP_STATUS } from '../constants/app.constants.js';

/**
 * Standardized Response Helper
 */
export const sendSuccess = (res, statusCode = HTTP_STATUS.OK, data = null, message = 'Success') => {
  return res.status(statusCode).json(new ApiResponse(statusCode, data, message));
};

export const sendCreated = (res, data = null, message = 'Resource created successfully') => {
  return res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, data, message));
};

export const sendError = (res, error) => {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      statusCode: error.statusCode,
      message: error.message,
      errors: error.errors || [],
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }

  const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = error.message || 'Internal Server Error';

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: [],
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};
