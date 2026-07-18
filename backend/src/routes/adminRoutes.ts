import { Router } from 'express';
import { getAdminStats, getAdminUsers, getAdminScans, deleteAdminScan } from '../controllers/adminController';
import { authenticateJWT, requireAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Protect all admin endpoints
router.use(authenticateJWT, requireAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.get('/scans', getAdminScans);
router.delete('/scans/:id', deleteAdminScan);

export default router;
