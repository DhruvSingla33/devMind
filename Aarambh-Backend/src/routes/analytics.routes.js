import { Router } from 'express';
import { getPrepLab } from '../controllers/analytics.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Student performance analytics & The Prep Lab
 */

/**
 * @swagger
 * /analytics/prep-lab:
 *   get:
 *     summary: Fetch comprehensive student performance metrics & streak progress
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student Prep Lab analytics
 */
router.get('/prep-lab', authenticateJWT, getPrepLab);

export default router;
