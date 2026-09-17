/**
 * Standardized API Response structure for successful HTTP responses
 */
export class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code (2xx)
   * @param {any} data - Response payload
   * @param {string} [message="Success"] - User-friendly message
   */
  constructor(statusCode, data = null, message = 'Success') {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}
