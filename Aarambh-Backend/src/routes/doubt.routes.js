import { Router } from 'express';
import {
  createDoubt,
  getMyDoubts,
  getDoubtById,
  getAllDoubts,
  answerDoubt,
} from '../controllers/doubt.controller.js';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// Client routes
router.post('/', authenticateJWT, createDoubt);
router.get('/my-doubts', authenticateJWT, getMyDoubts);
router.get('/:id', authenticateJWT, getDoubtById);

// Admin / Mentor routes
router.get('/admin/all', authenticateJWT, authorizeRoles('admin', 'mentor'), getAllDoubts);
router.post('/admin/:id/answer', authenticateJWT, authorizeRoles('admin', 'mentor'), answerDoubt);

export default router;
