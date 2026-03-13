import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { listUsers, approveNGO, getDashboardStats } from '../controllers/admin.js';

const router = Router();
router.use(authenticate, requireRole('admin'));
router.get('/users', listUsers);
router.patch('/users/:id/approve', approveNGO);
router.get('/stats', getDashboardStats);
export default router;
