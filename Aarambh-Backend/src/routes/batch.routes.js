import { Router } from 'express';
import {
  getBatches,
  getBatchById,
  enrollInBatch,
  createBatch,
  updateBatch,
  deleteBatch,
} from '../controllers/batch.controller.js';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// Client routes
router.get('/', getBatches);
router.get('/:id', getBatchById);
router.post('/:id/enroll', authenticateJWT, enrollInBatch);

// Admin routes
router.post('/admin', authenticateJWT, authorizeRoles('admin'), createBatch);
router.put('/admin/:id', authenticateJWT, authorizeRoles('admin'), updateBatch);
router.delete('/admin/:id', authenticateJWT, authorizeRoles('admin'), deleteBatch);

export default router;
