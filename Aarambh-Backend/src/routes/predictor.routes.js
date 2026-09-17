import { Router } from 'express';
import * as controller from '../controllers/predictor.controller.js';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: PredictorTools
 *   description: Aarambh NEET AIR Rank & Medical College Predictor Tools
 */

/**
 * @swagger
 * /tools/predict-rank:
 *   post:
 *     summary: Estimate NEET All India Rank (AIR) range from expected marks
 *     tags: [PredictorTools]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - marks
 *             properties:
 *               marks:
 *                 type: integer
 *                 example: 640
 *     responses:
 *       200:
 *         description: Rank prediction
 */
router.post('/predict-rank', controller.predictRank);

/**
 * @swagger
 * /tools/predict-colleges:
 *   post:
 *     summary: Suggest medical colleges based on expected marks, category & state
 *     tags: [PredictorTools]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - marks
 *             properties:
 *               marks:
 *                 type: integer
 *                 example: 640
 *               category:
 *                 type: string
 *                 enum: [GEN, OBC, SC, ST, EWS]
 *                 example: GEN
 *               state:
 *                 type: string
 *                 example: Delhi
 *     responses:
 *       200:
 *         description: Probable colleges recommendation
 */
router.post('/predict-colleges', controller.predictColleges);

// Admin Routes (Protected)
router.post(
  '/admin/college-cutoffs/bulk',
  authenticateJWT,
  authorizeRoles('admin'),
  controller.adminBulkImportCutoffs
);

export default router;
