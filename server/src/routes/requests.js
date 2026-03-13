import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateBody, schemas } from '../middleware/validate.js';
import { createRequest, getMyRequests, getRequest, approveRequest, rejectRequest, markCollected, cancelRequest } from '../controllers/requests.js';

const router = Router();
router.use(authenticate);

router.post('/', requireRole('ngo'), validateBody(schemas.createRequest), createRequest);
router.get('/my', getMyRequests);
router.get('/:id', getRequest);
router.patch('/:id/approve', requireRole('donor'), approveRequest);
router.patch('/:id/reject', requireRole('donor'), rejectRequest);
router.patch('/:id/collect', requireRole('ngo'), markCollected);
router.patch('/:id/cancel', requireRole('ngo'), cancelRequest);

export default router;
