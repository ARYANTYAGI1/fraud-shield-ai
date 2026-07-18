import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticateJWT, getDashboardStats);

export default router;
