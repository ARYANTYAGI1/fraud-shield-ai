import { Router } from 'express';
import { register, login, refresh, verifyEmail, forgotPassword, resetPassword } from '../controllers/authController';
import { authLimiter } from '../middlewares/limitMiddleware';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', refresh);
router.get('/verify', verifyEmail);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

export default router;
