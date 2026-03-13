import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateBody, schemas } from '../middleware/validate.js';
import { createReview, getListingReviews } from '../controllers/reviews.js';

const router = Router();
router.use(authenticate);
router.post('/', requireRole('ngo'), validateBody(schemas.createReview), createReview);
router.get('/listing/:listingId', getListingReviews);
export default router;
