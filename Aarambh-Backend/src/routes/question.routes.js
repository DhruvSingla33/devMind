import { Router } from 'express';
import * as controller from '../controllers/question.controller.js';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Questions
 *   description: NCERT line-by-line MCQs, PYQs & High Probability question bank
 */

/**
 * @swagger
 * /questions:
 *   get:
 *     summary: Paginated search for MCQs & PYQs
 *     tags: [Questions]
 *     parameters:
 *       - in: query
 *         name: chapterId
 *         schema:
 *           type: string
 *       - in: query
 *         name: pageNumber
 *         schema:
 *           type: integer
 *       - in: query
 *         name: exam
 *         schema:
 *           type: string
 *       - in: query
 *         name: isHighProbability
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: isPyq
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of questions
 */
router.get('/', controller.listQuestions);

/**
 * @swagger
 * /questions/submit-answer:
 *   post:
 *     summary: Verify student answer selection & return explanation
 *     tags: [Questions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questionId
 *               - selectedOption
 *             properties:
 *               questionId:
 *                 type: string
 *               selectedOption:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Answer check result
 */
router.post('/submit-answer', controller.checkAnswer);

// Admin Routes (Protected)
router.post('/admin', authenticateJWT, authorizeRoles('admin'), controller.adminCreateQuestion);
router.post('/admin/bulk', authenticateJWT, authorizeRoles('admin'), controller.adminBulkCreateQuestions);
router.put('/admin/:id', authenticateJWT, authorizeRoles('admin'), controller.adminUpdateQuestion);
router.delete('/admin/:id', authenticateJWT, authorizeRoles('admin'), controller.adminDeleteQuestion);

export default router;
