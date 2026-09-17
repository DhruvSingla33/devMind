import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { swaggerSpec } from './config/swagger.js';
import { UPLOADS_ROOT } from './middlewares/localUpload.middleware.js';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { ApiError } from './utils/ApiError.js';
import { globalLimiter, authLimiter } from './middlewares/rateLimiter.middleware.js';
import { cloudWatchRequestLogger } from './middlewares/logging.middleware.js';

const app = express();

// Trust proxy header for accurate IP rate limiting when deployed behind AWS ALB/EC2/ECS
app.set('trust proxy', 1);

// Security Middlewares
app.use(helmet());
app.use(cors());

// Global Rate Limiter (100 req/min)
app.use('/api', globalLimiter);

// Strict Rate Limiter on Authentication Endpoints
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/signup', authLimiter);
app.use('/api/v1/client/auth/login', authLimiter);
app.use('/api/v1/client/auth/signup', authLimiter);

// AWS CloudWatch Request-Response Audit Logger Middleware
app.use(cloudWatchRequestLogger);

// Morgan Console Logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body Parsing Middlewares
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Locally-uploaded files (textbook/chapter PDFs, images) — see
// localUpload.middleware.js. Parallel to the (currently unused) S3 flow in
// s3.service.js, which is left in place for later.
app.use('/uploads', express.static(UPLOADS_ROOT));

// Swagger API Documentation UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Primary API Routes (Sectioned into /client and /admin)
app.use('/api/v1', routes);

// Handle 404 Undefined Routes
app.use((req, res, next) => {
  next(new ApiError(404, `Cannot ${req.method} ${req.originalUrl}`));
});

// Global Centralized Error Handler
app.use(errorHandler);

export default app;
