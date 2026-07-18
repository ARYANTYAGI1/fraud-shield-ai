import { Router } from 'express';
import authRoutes from './authRoutes';
import scanRoutes from './scanRoutes';
import adminRoutes from './adminRoutes';
import { getDashboardStats } from '../controllers/dashboardController';
import { getProfile, getHistory } from '../controllers/profileController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

// Routes definitions matching the exact spec
router.use('/auth', authRoutes);
router.use('/scan', scanRoutes); // handles /scan/text, /scan/url, /scan/image, /scan/pdf
router.get('/dashboard', authenticateJWT, getDashboardStats);
router.get('/profile', authenticateJWT, getProfile);
router.get('/history', authenticateJWT, getHistory);
router.use('/admin', adminRoutes);

export default router;
