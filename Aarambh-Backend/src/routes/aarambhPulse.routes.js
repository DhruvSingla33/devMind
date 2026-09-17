import { Router } from 'express';
import * as controller from '../controllers/aarambhPulse.controller.js';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: AarambhPulse
 *   description: Aarambh Daily 5-minute memory workout & puzzles
 */

/**
 * @swagger
 * /aarambh-pulse/today:
 *   get:
 *     summary: Fetch today's Aarambh Pulse daily memory workout
 *     tags: [AarambhPulse]
 *     responses:
 *       200:
 *         description: Today's memory workout
 */
router.get('/today', controller.getTodayPulse);

// Admin Routes (Protected)
router.post('/admin', authenticateJWT, authorizeRoles('admin'), controller.adminCreatePulse);

export default router;
