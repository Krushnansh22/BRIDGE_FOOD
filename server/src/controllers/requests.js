import Request from '../models/Request.js';
import Listing from '../models/Listing.js';
import User from '../models/User.js';
import { createError } from '../middleware/errorHandler.js';
import { createNotification } from '../services/notifications.js';

export async function createRequest(req, res, next) {
  try {
    const { listingId, message } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) throw createError(404, 'LISTING_NOT_FOUND', 'Listing not found');
    if (listing.status !== 'available') {
      throw createError(400, 'NOT_AVAILABLE', 'This listing is not available for requests');
    }
    if (listing.donor.toString() === req.user._id.toString()) {
      throw createError(400, 'OWN_LISTING', 'Cannot request your own listing');
    }

    // Check for existing pending/approved request from this NGO
    const existing = await Request.findOne({
      listing: listingId,
      ngo: req.user._id,
      status: { $in: ['pending', 'approved'] },
    });
    if (existing) throw createError(409, 'ALREADY_REQUESTED', 'You already have an active request for this listing');

    const request = await Request.create({
      listing: listingId,
      ngo: req.user._id,
      donor: listing.donor,
      message: message || '',
    });

    // Update listing status and request count
    await Listing.findByIdAndUpdate(listingId, {
      $inc: { requestCount: 1 },
      status: 'requested',
      activeRequest: request._id,
    });

    // Notify donor
    const ngo = await User.findById(req.user._id).select('name');
    await createNotification(
      listing.donor,
      'request_received',
      '📬 New Pickup Request',
      `${ngo.name} wants to pick up "${listing.title}"`,
      { listingId, requestId: request._id }
    );

    const populated = await request.populate([
      { path: 'listing', select: 'title quantity quantityUnit category urgency' },
      { path: 'ngo', select: 'name phone' },
    ]);

    res.status(201).json({ success: true, data: populated });
  } catch (err) { next(err); }
}

export async function getMyRequests(req, res, next) {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const isNgo = req.user.role === 'ngo';
    const filter = isNgo ? { ngo: req.user._id } : { donor: req.user._id };
    if (status) filter.status = status;

    const lim = Math.min(parseInt(limit), 50);
    const skip = (parseInt(page) - 1) * lim;

    const [requests, total] = await Promise.all([
      Request.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip).limit(lim)
        .populate('listing', 'title quantity quantityUnit category urgency pickupAddress status')
        .populate(isNgo ? 'donor' : 'ngo', 'name phone'),
      Request.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: requests,
      pagination: { page: parseInt(page), limit: lim, total, totalPages: Math.ceil(total / lim) },
    });
  } catch (err) { next(err); }
}

export async function getRequest(req, res, next) {
  try {
    const request = await Request.findById(req.params.id)
      .populate('listing')
      .populate('ngo', 'name phone email')
      .populate('donor', 'name phone email');
    if (!request) throw createError(404, 'NOT_FOUND', 'Request not found');

    const userId = req.user._id.toString();
    if (request.ngo._id.toString() !== userId && request.donor._id.toString() !== userId && req.user.role !== 'admin') {
      throw createError(403, 'FORBIDDEN', 'Access denied');
    }

    res.json({ success: true, data: request });
  } catch (err) { next(err); }
}

export async function approveRequest(req, res, next) {
  try {
    const request = await Request.findById(req.params.id).populate('listing ngo');
    if (!request) throw createError(404, 'NOT_FOUND', 'Request not found');
    if (request.donor.toString() !== req.user._id.toString()) {
      throw createError(403, 'FORBIDDEN', 'Not your listing request');
    }
    if (request.status !== 'pending') {
      throw createError(400, 'INVALID_STATUS', 'Request is not pending');
    }

    await Request.findByIdAndUpdate(req.params.id, { status: 'approved' });

    // Reject all other pending requests for this listing
    await Request.updateMany(
      { listing: request.listing._id, status: 'pending', _id: { $ne: request._id } },
      { status: 'rejected' }
    );

    await createNotification(
      request.ngo._id,
      'request_approved',
      '✅ Request Approved!',
      `Your request for "${request.listing.title}" has been approved. Please proceed with pickup.`,
      { listingId: request.listing._id, requestId: request._id }
    );

    res.json({ success: true, message: 'Request approved' });
  } catch (err) { next(err); }
}

export async function rejectRequest(req, res, next) {
  try {
    const request = await Request.findById(req.params.id).populate('listing ngo');
    if (!request) throw createError(404, 'NOT_FOUND', 'Request not found');
    if (request.donor.toString() !== req.user._id.toString()) {
      throw createError(403, 'FORBIDDEN', 'Not your listing request');
    }
    if (request.status !== 'pending') {
      throw createError(400, 'INVALID_STATUS', 'Request is not pending');
    }

    await Request.findByIdAndUpdate(req.params.id, { status: 'rejected' });

    // If this was the active request, revert listing to available
    const listing = await Listing.findById(request.listing._id);
    if (listing?.activeRequest?.toString() === request._id.toString()) {
      const otherPending = await Request.findOne({ listing: listing._id, status: 'pending' });
      await Listing.findByIdAndUpdate(listing._id, {
        status: otherPending ? 'requested' : 'available',
        activeRequest: otherPending?._id || null,
      });
    }

    await createNotification(
      request.ngo._id,
      'request_rejected',
      '❌ Request Not Approved',
      `Your request for "${request.listing.title}" was not approved this time.`,
      { listingId: request.listing._id, requestId: request._id }
    );

    res.json({ success: true, message: 'Request rejected' });
  } catch (err) { next(err); }
}

export async function markCollected(req, res, next) {
  try {
    const request = await Request.findById(req.params.id).populate('listing');
    if (!request) throw createError(404, 'NOT_FOUND', 'Request not found');
    if (request.ngo.toString() !== req.user._id.toString()) {
      throw createError(403, 'FORBIDDEN', 'Not your request');
    }
    if (request.status !== 'approved') {
      throw createError(400, 'INVALID_STATUS', 'Request must be approved before marking collected');
    }

    await Request.findByIdAndUpdate(req.params.id, { status: 'collected', pickedUpAt: new Date() });

    const qty = request.listing.quantity;
    const meals = request.listing.quantityUnit === 'servings' ? qty : Math.round(qty * 4);

    // Update listing status
    await Listing.findByIdAndUpdate(request.listing._id, { status: 'collected' });

    // Update stats
    await User.findByIdAndUpdate(request.donor, {
      $inc: { 'stats.totalDonated': qty, 'stats.mealsCount': meals },
    });
    await User.findByIdAndUpdate(request.ngo, {
      $inc: { 'stats.totalCollected': qty, 'stats.mealsCount': meals },
    });

    res.json({ success: true, message: 'Marked as collected' });
  } catch (err) { next(err); }
}

export async function cancelRequest(req, res, next) {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) throw createError(404, 'NOT_FOUND', 'Request not found');
    if (request.ngo.toString() !== req.user._id.toString()) {
      throw createError(403, 'FORBIDDEN', 'Not your request');
    }
    if (!['pending', 'approved'].includes(request.status)) {
      throw createError(400, 'INVALID_STATUS', 'Cannot cancel this request');
    }

    await Request.findByIdAndUpdate(req.params.id, { status: 'cancelled' });

    // Revert listing to available
    await Listing.findByIdAndUpdate(request.listing, {
      status: 'available',
      activeRequest: null,
    });

    res.json({ success: true, message: 'Request cancelled' });
  } catch (err) { next(err); }
}

export async function getListingRequests(req, res, next) {
  try {
    const listing = await Listing.findById(req.params.listingId);
    if (!listing) throw createError(404, 'LISTING_NOT_FOUND', 'Listing not found');
    if (listing.donor.toString() !== req.user._id.toString()) {
      throw createError(403, 'FORBIDDEN', 'Not your listing');
    }

    const requests = await Request.find({ listing: req.params.listingId })
      .sort({ createdAt: -1 })
      .populate('ngo', 'name phone email ngoDetails stats');

    res.json({ success: true, data: requests });
  } catch (err) { next(err); }
}
