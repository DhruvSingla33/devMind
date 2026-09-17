import { Router } from 'express';
import * as controller from '../controllers/stats.controller.js';

const router = Router();

/**
 * @swagger
 * /stats/public:
 *   get:
 *     summary: Real, anonymized platform stats for the public landing page
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Aggregate stats and a fully anonymized recent-activity feed
 */
router.get('/public', controller.getPublicStats);

export default router;
