import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateBody, schemas } from '../middleware/validate.js';
import { createListing, getListings, getNearbyListings, getListing, getMyListings, updateListing, deleteListing, markExpired } from '../controllers/listings.js';
import { getListingRequests } from '../controllers/requests.js';

const router = Router();

router.use(authenticate);

router.get('/', getListings);
router.get('/nearby', requireRole('ngo'), getNearbyListings);
router.get('/my', requireRole('donor'), getMyListings);
router.get('/:id', getListing);
router.post('/', requireRole('donor'), validateBody(schemas.createListing), createListing);
router.put('/:id', requireRole('donor'), updateListing);
router.delete('/:id', requireRole('donor'), deleteListing);
router.patch('/:id/mark-expired', requireRole('donor'), markExpired);
router.get('/:listingId/requests', requireRole('donor'), getListingRequests);

export default router;
