import { Router } from 'express';
import * as controller from '../controllers/test.controller.js';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Tests
 *   description: CBT Mock Tests & Mix Quiz Engine
 */

/**
 * @swagger
 * /tests:
 *   get:
 *     summary: List available mock tests
 *     tags: [Tests]
 *     parameters:
 *       - in: query
 *         name: exam
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of tests
 */
router.get('/', controller.listTests);

/**
 * @swagger
 * /tests/create-mix-quiz:
 *   post:
 *     summary: Generate a dynamic Mix Quiz from selected chapters
 *     tags: [Tests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chapterIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               questionCount:
 *                 type: integer
 *                 example: 30
 *     responses:
 *       201:
 *         description: Mix quiz created
 */
router.post('/create-mix-quiz', controller.createMixQuiz);

/**
 * @swagger
 * /tests/{id}/start:
 *   post:
 *     summary: Start a CBT mock test attempt session
 *     tags: [Tests]
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
 *         description: Test session initialized
 */
router.post('/:id/start', authenticateJWT, controller.startTest);

/**
 * @swagger
 * /tests/{attemptId}/submit:
 *   post:
 *     summary: Submit CBT mock test answers & get score analysis (+4/-1 scheme)
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Test session submitted and graded
 */
router.post('/:attemptId/submit', authenticateJWT, controller.submitTest);

/**
 * @swagger
 * /tests/my-attempts:
 *   get:
 *     summary: View history of user test attempts & performance
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User attempt history
 */
router.get('/my-attempts', authenticateJWT, controller.getMyAttempts);

// Admin Routes (Protected)
router.post('/admin', authenticateJWT, authorizeRoles('admin'), controller.adminCreateTest);
router.put('/admin/:id', authenticateJWT, authorizeRoles('admin'), controller.adminUpdateTest);
router.delete('/admin/:id', authenticateJWT, authorizeRoles('admin'), controller.adminDeleteTest);

export default router;
