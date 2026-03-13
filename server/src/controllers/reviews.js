import { Review } from '../models/index.js';
import Request from '../models/Request.js';
import { createError } from '../middleware/errorHandler.js';

export async function createReview(req, res, next) {
  try {
    const { requestId, rating, comment } = req.body;

    const request = await Request.findById(requestId).populate('listing');
    if (!request) throw createError(404, 'NOT_FOUND', 'Request not found');
    if (request.ngo.toString() !== req.user._id.toString()) {
      throw createError(403, 'FORBIDDEN', 'Only the NGO that collected can leave a review');
    }
    if (request.status !== 'collected') {
      throw createError(400, 'NOT_COLLECTED', 'Can only review after collection');
    }

    const existing = await Review.findOne({ request: requestId });
    if (existing) throw createError(409, 'ALREADY_REVIEWED', 'Already reviewed this request');

    const review = await Review.create({
      request: requestId,
      listing: request.listing._id,
      donor: request.donor,
      ngo: req.user._id,
      rating,
      comment: comment || '',
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) { next(err); }
}

export async function getListingReviews(req, res, next) {
  try {
    const reviews = await Review.find({ listing: req.params.listingId })
      .sort({ createdAt: -1 })
      .populate('ngo', 'name');
    res.json({ success: true, data: reviews });
  } catch (err) { next(err); }
}
