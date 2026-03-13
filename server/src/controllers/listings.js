import Listing from '../models/Listing.js';
import { createError } from '../middleware/errorHandler.js';
import { computeShelfLife } from '../services/shelfLife.js';
import { notifyNearbyNGOs } from '../services/notifications.js';

export async function createListing(req, res, next) {
  try {
    const {
      title, description, category, quantity, quantityUnit,
      preparedAt, storageType, pickupAddress, latitude, longitude,
      pickupWindowStart, pickupWindowEnd,
    } = req.body;

    const { expiresAt, urgency, urgencyScore } = computeShelfLife(category, storageType, preparedAt);

    if (urgency === 'expired') {
      throw createError(400, 'ALREADY_EXPIRED', 'Food is already past its estimated shelf life');
    }

    const listing = await Listing.create({
      donor: req.user._id,
      title, description, category, quantity, quantityUnit,
      preparedAt, storageType, expiresAt, urgency, urgencyScore,
      pickupAddress,
      location: { type: 'Point', coordinates: [longitude, latitude] },
      pickupWindowStart: pickupWindowStart || undefined,
      pickupWindowEnd: pickupWindowEnd || undefined,
      status: 'available',
    });

    // Notify nearby NGOs in background
    notifyNearbyNGOs(
      listing,
      'new_listing',
      '🍱 New food available nearby',
      `${title} - ${quantity} ${quantityUnit} available for pickup`
    ).catch(console.error);

    res.status(201).json({ success: true, data: listing });
  } catch (err) { next(err); }
}

export async function getListings(req, res, next) {
  try {
    const { page = 1, limit = 20, urgency, category, status = 'available' } = req.query;
    const filter = { status };
    if (urgency) filter.urgency = urgency;
    if (category) filter.category = category;

    const skip = (parseInt(page) - 1) * Math.min(parseInt(limit), 50);
    const lim = Math.min(parseInt(limit), 50);

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .sort({ urgencyScore: -1, createdAt: -1 })
        .skip(skip).limit(lim)
        .populate('donor', 'name phone location'),
      Listing.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: listings,
      pagination: { page: parseInt(page), limit: lim, total, totalPages: Math.ceil(total / lim) },
    });
  } catch (err) { next(err); }
}

export async function getNearbyListings(req, res, next) {
  try {
    const { lat, lng, radiusKm = 10, urgency, category, page = 1, limit = 20 } = req.query;
    if (!lat || !lng) throw createError(400, 'MISSING_COORDS', 'lat and lng are required');

    const filter = {
      status: 'available',
      location: {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseFloat(radiusKm) * 1000,
        },
      },
    };
    if (urgency) filter.urgency = urgency;
    if (category) filter.category = category;

    const lim = Math.min(parseInt(limit), 50);
    const skip = (parseInt(page) - 1) * lim;

    const listings = await Listing.find(filter)
      .sort({ urgencyScore: -1 })
      .skip(skip).limit(lim)
      .populate('donor', 'name phone');

    res.json({ success: true, data: listings });
  } catch (err) { next(err); }
}

export async function getListing(req, res, next) {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('donor', 'name phone email stats location')
      .populate('activeRequest');
    if (!listing) throw createError(404, 'LISTING_NOT_FOUND', 'Listing not found');
    res.json({ success: true, data: listing });
  } catch (err) { next(err); }
}

export async function getMyListings(req, res, next) {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = { donor: req.user._id };
    if (status) filter.status = status;

    const lim = Math.min(parseInt(limit), 50);
    const skip = (parseInt(page) - 1) * lim;

    const [listings, total] = await Promise.all([
      Listing.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim),
      Listing.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: listings,
      pagination: { page: parseInt(page), limit: lim, total, totalPages: Math.ceil(total / lim) },
    });
  } catch (err) { next(err); }
}

export async function updateListing(req, res, next) {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) throw createError(404, 'LISTING_NOT_FOUND', 'Listing not found');
    if (listing.donor.toString() !== req.user._id.toString()) {
      throw createError(403, 'FORBIDDEN', 'Not your listing');
    }
    if (listing.status !== 'available') {
      throw createError(400, 'CANNOT_UPDATE', 'Can only update available listings');
    }

    const allowed = ['title', 'description', 'quantity', 'quantityUnit', 'pickupAddress', 'pickupWindowStart', 'pickupWindowEnd'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    // Recompute shelf life if relevant fields changed
    if (req.body.category || req.body.storageType || req.body.preparedAt) {
      const cat = req.body.category || listing.category;
      const stor = req.body.storageType || listing.storageType;
      const prep = req.body.preparedAt || listing.preparedAt;
      const { expiresAt, urgency, urgencyScore } = computeShelfLife(cat, stor, prep);
      updates.category = cat;
      updates.storageType = stor;
      updates.preparedAt = prep;
      updates.expiresAt = expiresAt;
      updates.urgency = urgency;
      updates.urgencyScore = urgencyScore;
    }

    if (req.body.latitude && req.body.longitude) {
      updates.location = { type: 'Point', coordinates: [req.body.longitude, req.body.latitude] };
      updates.pickupAddress = req.body.pickupAddress || listing.pickupAddress;
    }

    const updated = await Listing.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
}

export async function deleteListing(req, res, next) {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) throw createError(404, 'LISTING_NOT_FOUND', 'Listing not found');
    if (listing.donor.toString() !== req.user._id.toString()) {
      throw createError(403, 'FORBIDDEN', 'Not your listing');
    }
    if (listing.status !== 'available') {
      throw createError(400, 'CANNOT_DELETE', 'Can only delete available listings');
    }
    await listing.deleteOne();
    res.json({ success: true, message: 'Listing deleted' });
  } catch (err) { next(err); }
}

export async function markExpired(req, res, next) {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) throw createError(404, 'LISTING_NOT_FOUND', 'Listing not found');
    if (listing.donor.toString() !== req.user._id.toString()) {
      throw createError(403, 'FORBIDDEN', 'Not your listing');
    }
    const updated = await Listing.findByIdAndUpdate(
      req.params.id,
      { status: 'expired', expiredAt: new Date() },
      { new: true }
    );
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
}
