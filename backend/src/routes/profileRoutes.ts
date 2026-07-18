import { Router } from 'express';
import { getProfile, getHistory } from '../controllers/profileController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticateJWT, getProfile);
router.get('/history', authenticateJWT, getHistory);

export default router;
