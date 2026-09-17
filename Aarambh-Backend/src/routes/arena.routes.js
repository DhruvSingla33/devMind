import { Router } from 'express';
import * as controller from '../controllers/arena.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Arena
 *   description: 1v1 Challenge Arena (Battle a friend)
 */

/**
 * @swagger
 * /arena/create:
 *   post:
 *     summary: Create a 1v1 Arena challenge link
 *     tags: [Arena]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subject:
 *                 type: string
 *                 example: Biology
 *               questionCount:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       201:
 *         description: Arena challenge created
 */
router.post('/create', authenticateJWT, controller.createChallenge);

/**
 * @swagger
 * /arena/{id}/join:
 *   post:
 *     summary: Join an active Arena challenge as opponent
 *     tags: [Arena]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Joined challenge
 */
router.post('/:id/join', authenticateJWT, controller.joinChallenge);

/**
 * @swagger
 * /arena/{id}/submit:
 *   post:
 *     summary: Submit 1v1 battle answers & trigger winner calculation
 *     tags: [Arena]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               timeSeconds:
 *                 type: integer
 *                 example: 45
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: string
 *                     selectedOption:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Battle answers submitted
 */
router.post('/:id/submit', authenticateJWT, controller.submitAnswers);

/**
 * @swagger
 * /arena/{id}:
 *   get:
 *     summary: Get Arena challenge leaderboard & results
 *     tags: [Arena]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Challenge details
 */
router.get('/:id', controller.getChallengeDetails);

export default router;
