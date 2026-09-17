import { logger } from '../utils/logger.js';

/**
 * CloudWatch Request-Response Audit Logger Middleware
 * Captures request details, execution duration (ms), and response status code in a unified format
 */
export const cloudWatchRequestLogger = (req, res, next) => {
  const startHrTime = process.hrtime();

  res.on('finish', () => {
    const elapsedHrTime = process.hrtime(startHrTime);
    const responseTimeMs = (elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6).toFixed(2);

    const logPayload = {
      timestamp: new Date().toISOString(),
      correlationId: req.headers['x-correlation-id'] || req.headers['x-request-id'] || `req_${Date.now()}`,
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTimeMs: Number(responseTimeMs),
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'] || '',
      userId: req.user ? req.user._id : 'anonymous',
      userRole: req.user ? req.user.role : 'guest',
      query: Object.keys(req.query).length ? req.query : undefined,
    };

    if (res.statusCode >= 500) {
      logger.error(`[API 5xx Server Error] ${req.method} ${req.originalUrl} - ${res.statusCode} (${responseTimeMs}ms)`, logPayload);
    } else if (res.statusCode >= 400) {
      logger.warn(`[API 4xx Client Error] ${req.method} ${req.originalUrl} - ${res.statusCode} (${responseTimeMs}ms)`, logPayload);
    } else {
      logger.info(`[API Success] ${req.method} ${req.originalUrl} - ${res.statusCode} (${responseTimeMs}ms)`, logPayload);
    }
  });

  next();
};
