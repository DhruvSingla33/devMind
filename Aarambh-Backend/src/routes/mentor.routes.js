import { Router } from 'express';
import * as controller from '../controllers/mentor.controller.js';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Mentors
 *   description: 1:1 Mentorship with Rankers & 7-Day Streak Rewards
 */

/**
 * @swagger
 * /mentors:
 *   get:
 *     summary: List top ranker mentors
 *     tags: [Mentors]
 *     responses:
 *       200:
 *         description: List of mentors
 */
router.get('/', controller.listMentors);

/**
 * @swagger
 * /mentors/{id}/slots:
 *   get:
 *     summary: Get available 30-min booking slots for a mentor
 *     tags: [Mentors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of open slots
 */
router.get('/:id/slots', controller.getSlots);

/**
 * @swagger
 * /mentors/book:
 *   post:
 *     summary: Book a 1:1 mentor session (paid or via free streak credit)
 *     tags: [Mentors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mentorId
 *               - slotId
 *             properties:
 *               mentorId:
 *                 type: string
 *               slotId:
 *                 type: string
 *               paymentType:
 *                 type: string
 *                 enum: [paid, free_streak_credit]
 *     responses:
 *       200:
 *         description: Booking confirmed
 */
router.post('/book', authenticateJWT, controller.bookSession);

/**
 * @swagger
 * /mentors/my-streak:
 *   get:
 *     summary: Get user practice streak & free session credit status
 *     tags: [Mentors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Practice streak stats
 */
router.get('/my-streak', authenticateJWT, controller.getStreak);

/**
 * @swagger
 * /mentors/log-practice:
 *   post:
 *     summary: Log solved MCQ count to update daily streak
 *     tags: [Mentors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               count:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       200:
 *         description: Streak updated
 */
router.post('/log-practice', authenticateJWT, controller.logPracticeProgress);

// Admin Routes (Protected)
router.post('/admin', authenticateJWT, authorizeRoles('admin'), controller.adminCreateMentor);
router.post('/admin/:id/slots', authenticateJWT, authorizeRoles('admin'), controller.adminAddSlots);

export default router;
