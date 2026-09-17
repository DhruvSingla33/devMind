import { Router } from 'express';
import * as controller from '../controllers/prediction.controller.js';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Predictions
 *   description: Exam Question Predictions & Match Proof Reports
 */

/**
 * @swagger
 * /predictions/match-report:
 *   get:
 *     summary: View side-by-side proof matching actual exam paper questions to predicted questions
 *     tags: [Predictions]
 *     parameters:
 *       - in: query
 *         name: examName
 *         schema:
 *           type: string
 *           example: NEET 2026
 *     responses:
 *       200:
 *         description: Match report proof data
 */
router.get('/match-report', controller.getMatchReport);

// Admin Routes (Protected)
router.post('/admin', authenticateJWT, authorizeRoles('admin'), controller.adminCreateMatch);

export default router;
