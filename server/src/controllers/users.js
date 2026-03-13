import User from '../models/User.js';
import { createError } from '../middleware/errorHandler.js';
import { coordsToAddress } from '../utils/geocode.js';

export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash -refreshTokens -emailVerificationToken -passwordResetToken -passwordResetExpires');
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

export async function updateMe(req, res, next) {
  try {
    const allowed = ['name', 'phone'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true })
      .select('-passwordHash -refreshTokens');
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

export async function updatePushToken(req, res, next) {
  try {
    const { expoPushToken } = req.body;
    if (!expoPushToken) throw createError(400, 'MISSING_TOKEN', 'Push token required');
    await User.findByIdAndUpdate(req.user._id, { expoPushToken });
    res.json({ success: true, message: 'Push token updated' });
  } catch (err) { next(err); }
}

export async function updateLocation(req, res, next) {
  try {
    const { latitude, longitude, address } = req.body;
    let resolvedAddress = address;
    if (!resolvedAddress) {
      try {
        resolvedAddress = await coordsToAddress(latitude, longitude);
      } catch {
        resolvedAddress = `${latitude}, ${longitude}`;
      }
    }
    await User.findByIdAndUpdate(req.user._id, {
      location: { type: 'Point', coordinates: [longitude, latitude], address: resolvedAddress },
    });
    res.json({ success: true, message: 'Location updated', data: { address: resolvedAddress } });
  } catch (err) { next(err); }
}

export async function getMyStats(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select('stats role name');
    res.json({ success: true, data: user.stats });
  } catch (err) { next(err); }
}
