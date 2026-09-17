import { Router } from 'express';
import textbookRoutes from '../textbook.routes.js';
import questionRoutes from '../question.routes.js';
import testRoutes from '../test.routes.js';
import mentorRoutes from '../mentor.routes.js';
import aarambhPulseRoutes from '../aarambhPulse.routes.js';
import predictorRoutes from '../predictor.routes.js';
import uploadRoutes from '../upload.routes.js';
import predictionRoutes from '../prediction.routes.js';
import batchRoutes from '../batch.routes.js';
import doubtRoutes from '../doubt.routes.js';
import { checkDbConnection } from '../../config/db.js';
import { authenticateJWT, authorizeRoles } from '../../middlewares/auth.middleware.js';
import { ROLES } from '../../constants/app.constants.js';

const router = Router();

/**
 * Admin API Section — Admin Dashboard CMS Endpoints
 * All endpoints are strictly guarded by JWT authentication + Admin role authorization
 */
router.use(checkDbConnection, authenticateJWT, authorizeRoles(ROLES.ADMIN, ROLES.MENTOR));

router.use('/textbooks', textbookRoutes);
router.use('/questions', questionRoutes);
router.use('/tests', testRoutes);
router.use('/mentors', mentorRoutes);
router.use('/aarambh-pulse', aarambhPulseRoutes);
router.use('/tools', predictorRoutes);
router.use('/predictions', predictionRoutes);
router.use('/upload', uploadRoutes);
router.use('/batches', batchRoutes);
router.use('/doubts', doubtRoutes);

export default router;

