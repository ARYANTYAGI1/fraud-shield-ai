import { Router } from 'express';
import { scanText, scanURL, scanImage, scanPDF, upload } from '../controllers/scanController';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { scanLimiter } from '../middlewares/limitMiddleware';

const router = Router();

// Protect all scanning endpoints with JWT auth
router.use(authenticateJWT);

router.post('/text', scanLimiter, scanText);
router.post('/url', scanLimiter, scanURL);
router.post('/image', scanLimiter, upload.single('image'), scanImage);
router.post('/pdf', scanLimiter, upload.single('pdf'), scanPDF);

export default router;
