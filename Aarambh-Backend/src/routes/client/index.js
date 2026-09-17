import { Router } from 'express';
import authRoutes from '../auth.routes.js';
import textbookRoutes from '../textbook.routes.js';
import questionRoutes from '../question.routes.js';
import testRoutes from '../test.routes.js';
import mentorRoutes from '../mentor.routes.js';
import aarambhPulseRoutes from '../aarambhPulse.routes.js';
import predictorRoutes from '../predictor.routes.js';
import uploadRoutes from '../upload.routes.js';
import arenaRoutes from '../arena.routes.js';
import analyticsRoutes from '../analytics.routes.js';
import predictionRoutes from '../prediction.routes.js';
import batchRoutes from '../batch.routes.js';
import doubtRoutes from '../doubt.routes.js';
import bookmarkRoutes from '../bookmark.routes.js';
import statsRoutes from '../stats.routes.js';
import { checkDbConnection } from '../../config/db.js';
import { authenticateJWT } from '../../middlewares/auth.middleware.js';
import { cacheMiddleware } from '../../middlewares/cache.middleware.js';

const router = Router();

/**
 * Client API Section — React Native Web & Mobile App Endpoints
 */

// Client Auth Endpoints (Signup, Login, Phone OTP, Google OAuth)
router.use('/auth', checkDbConnection, authRoutes);

// Client Utility Tools & Media Viewer
router.use('/tools', predictorRoutes);
router.use('/upload', uploadRoutes);
router.use('/batches', checkDbConnection, batchRoutes);

// Public Content Browsing (textbooks/chapters/questions can be browsed and
// answer-checked without an account, same as the formal content pages —
// only *formal* actions like starting a tracked test attempt, bookmarking,
// or booking a mentor require a login. See question.service.js for the
// field-level answer-key redaction that makes the public question list safe.)
router.use('/textbooks', checkDbConnection, cacheMiddleware('textbooks', 300), textbookRoutes);
router.use('/questions', checkDbConnection, questionRoutes);
router.use('/stats', checkDbConnection, cacheMiddleware('stats', 60), statsRoutes);

// Protected Student Content Modules (Requires Authentication)
router.use('/tests', checkDbConnection, authenticateJWT, testRoutes);
router.use('/mentors', checkDbConnection, authenticateJWT, cacheMiddleware('mentors', 300), mentorRoutes);
router.use('/aarambh-pulse', checkDbConnection, authenticateJWT, cacheMiddleware('pulse', 300), aarambhPulseRoutes);
router.use('/arena', checkDbConnection, authenticateJWT, arenaRoutes);
router.use('/analytics', checkDbConnection, authenticateJWT, analyticsRoutes);
router.use('/predictions', checkDbConnection, authenticateJWT, predictionRoutes);
router.use('/doubts', checkDbConnection, authenticateJWT, doubtRoutes);
router.use('/bookmarks', checkDbConnection, authenticateJWT, bookmarkRoutes);

export default router;

