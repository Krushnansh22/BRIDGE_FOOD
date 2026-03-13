import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateBody, schemas } from '../middleware/validate.js';
import { getMe, updateMe, updatePushToken, updateLocation, getMyStats } from '../controllers/users.js';

const router = Router();
router.use(authenticate);
router.get('/me', getMe);
router.put('/me', validateBody(schemas.updateProfile), updateMe);
router.patch('/me/push-token', updatePushToken);
router.patch('/me/location', validateBody(schemas.updateLocation), updateLocation);
router.get('/me/stats', getMyStats);
export default router;
