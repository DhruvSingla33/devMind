/**
 * Custom Operational Error class for standardized error responses
 */
export class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code (4xx / 5xx)
   * @param {string} message - Error message
   * @param {Array} [errors=[]] - Array of specific error details/validation errors
   * @param {string} [stack=""] - Stack trace
   */
  constructor(statusCode, message = 'Something went wrong', errors = [], stack = '') {
    super(message);
    this.success = false;
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.data = null;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
