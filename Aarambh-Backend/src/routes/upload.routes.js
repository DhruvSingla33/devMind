import { Router } from 'express';
import { getPresignedUrl, getImage, uploadLocalFile } from '../controllers/upload.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { localUpload } from '../middlewares/localUpload.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: MediaUploads
 *   description: AWS S3 Direct Upload & Image Retrieval
 */

/**
 * @swagger
 * /upload/presigned-url:
 *   post:
 *     summary: Generate an AWS S3 presigned PUT URL for direct image uploads
 *     tags: [MediaUploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fileType
 *             properties:
 *               fileType:
 *                 type: string
 *                 example: image/png
 *               folder:
 *                 type: string
 *                 example: questions
 *     responses:
 *       200:
 *         description: Presigned upload URL generated
 */
router.post('/presigned-url', authenticateJWT, getPresignedUrl);

/**
 * @swagger
 * /upload/image/{fileKey}:
 *   get:
 *     summary: Retrieve CDN/Presigned GET URL for viewing uploaded S3 image
 *     tags: [MediaUploads]
 *     parameters:
 *       - in: path
 *         name: fileKey
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image URL generated
 */
router.get('/image/*', getImage);

/**
 * @swagger
 * /upload/local/{folder}:
 *   post:
 *     summary: Upload a file directly to local disk storage (uploads/<folder>/)
 *     tags: [MediaUploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: File uploaded, returns fileKey + publicUrl
 */
router.post('/local/:folder', authenticateJWT, localUpload.single('file'), uploadLocalFile);

export default router;
