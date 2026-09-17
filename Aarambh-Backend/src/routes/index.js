import { Router } from 'express';
import clientRoutes from './client/index.js';
import adminRoutes from './admin/index.js';

const router = Router();

// System Health Check Endpoint
/**
 * @swagger
 * /health:
 *   get:
 *     summary: System health check
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is running and healthy
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    app: 'Aarambh Backend API (Enterprise Edition)',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Section 1: Client API Section (React Native Web & Mobile Apps)
router.use('/client', clientRoutes);

// Section 2: Admin API Section (Admin Dashboard CMS)
router.use('/admin', adminRoutes);

// Alias Top-Level Modules to Client Section for API Compatibility
router.use('/', clientRoutes);

export default router;
