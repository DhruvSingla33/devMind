import { MulterError } from 'multer';
import { ApiError } from '../utils/ApiError.js';

/**
 * Global Express Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Multer errors (e.g. LIMIT_FILE_SIZE on an oversized upload) are client
  // mistakes, not server faults — surface them as 400s instead of defaulting
  // to 500 below.
  if (error instanceof MulterError) {
    const message =
      error.code === 'LIMIT_FILE_SIZE' ? 'File is too large.' : `Upload error: ${error.message}`;
    error = new ApiError(400, message);
  }

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, [], err.stack);
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  };

  res.status(error.statusCode).json(response);
};
