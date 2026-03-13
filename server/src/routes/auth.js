import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, refreshToken, logout, verifyEmail, forgotPassword, resetPassword } from '../controllers/auth.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody, schemas } from '../middleware/validate.js';

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } } });

router.post('/register', authLimiter, validateBody(schemas.register), register);
router.post('/login', authLimiter, validateBody(schemas.login), login);
router.post('/refresh', authLimiter, refreshToken);
router.post('/logout', authenticate, logout);
router.get('/verify/:token', verifyEmail);
router.post('/forgot-password', authLimiter, validateBody(schemas.forgotPassword), forgotPassword);
router.post('/reset-password', authLimiter, validateBody(schemas.resetPassword), resetPassword);

export default router;
