import { Router } from 'express';
import * as controller from '../controllers/textbook.controller.js';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Textbooks
 *   description: NCERT Textbooks & Chapters Management
 */

/**
 * @swagger
 * /textbooks:
 *   get:
 *     summary: List textbooks with filters
 *     tags: [Textbooks]
 *     parameters:
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *       - in: query
 *         name: classLevel
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of textbooks
 */
router.get('/', controller.listTextbooks);

/**
 * @swagger
 * /textbooks/{code}:
 *   get:
 *     summary: Get textbook details and chapters
 *     tags: [Textbooks]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Textbook details
 */
router.get('/:code', controller.getTextbook);

/**
 * @swagger
 * /textbooks/{code}/chapters/{chapterNumber}:
 *   get:
 *     summary: Get chapter details
 *     tags: [Textbooks]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: chapterNumber
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chapter details
 */
router.get('/:code/chapters/:chapterNumber', controller.getChapter);

/**
 * @swagger
 * /textbooks/{code}/chapters/{chapterNumber}/pdf:
 *   get:
 *     summary: Get a PDF containing only this chapter's pages (sliced from the textbook's master PDF, cached)
 *     tags: [Textbooks]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: chapterNumber
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: fileKey + publicUrl for the chapter's PDF
 */
router.get('/:code/chapters/:chapterNumber/pdf', controller.getChapterPdf);

// Admin Routes (Protected)
router.post('/admin', authenticateJWT, authorizeRoles('admin'), controller.adminCreateTextbook);
router.put('/admin/:id', authenticateJWT, authorizeRoles('admin'), controller.adminUpdateTextbook);
router.delete('/admin/:id', authenticateJWT, authorizeRoles('admin'), controller.adminDeleteTextbook);

router.post(
  '/admin/:textbookId/chapters',
  authenticateJWT,
  authorizeRoles('admin'),
  controller.adminCreateChapter
);
router.put(
  '/admin/chapters/:chapterId',
  authenticateJWT,
  authorizeRoles('admin'),
  controller.adminUpdateChapter
);
router.delete(
  '/admin/chapters/:chapterId',
  authenticateJWT,
  authorizeRoles('admin'),
  controller.adminDeleteChapter
);

// Content pages now belong to the BOOK (each page holds sections + quiz).
// Create a page under a textbook:
router.post(
  '/admin/textbooks/:textbookId/pages',
  authenticateJWT,
  authorizeRoles('admin'),
  controller.adminCreatePage
);
// List the pages that fall inside a chapter's page-range (admin view w/ answers):
router.get(
  '/admin/chapters/:chapterId/pages',
  authenticateJWT,
  authorizeRoles('admin'),
  controller.adminListChapterPages
);
router.put(
  '/admin/pages/:pageId',
  authenticateJWT,
  authorizeRoles('admin'),
  controller.adminUpdatePage
);
router.delete(
  '/admin/pages/:pageId',
  authenticateJWT,
  authorizeRoles('admin'),
  controller.adminDeletePage
);

export default router;
