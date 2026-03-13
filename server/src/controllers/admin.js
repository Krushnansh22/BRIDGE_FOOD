import User from '../models/User.js';
import Listing from '../models/Listing.js';
import Request from '../models/Request.js';
import { sendNGOApprovalEmail } from '../services/email.js';
import { createError } from '../middleware/errorHandler.js';

export async function listUsers(req, res, next) {
  try {
    const { page = 1, limit = 20, role, isApproved } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isApproved !== undefined) filter.isApproved = isApproved === 'true';

    const lim = Math.min(parseInt(limit), 50);
    const skip = (parseInt(page) - 1) * lim;

    const [users, total] = await Promise.all([
      User.find(filter).select('-passwordHash -refreshTokens').sort({ createdAt: -1 }).skip(skip).limit(lim),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: { page: parseInt(page), limit: lim, total, totalPages: Math.ceil(total / lim) },
    });
  } catch (err) { next(err); }
}

export async function approveNGO(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw createError(404, 'NOT_FOUND', 'User not found');
    if (user.role !== 'ngo') throw createError(400, 'NOT_NGO', 'User is not an NGO');
    if (user.isApproved) throw createError(400, 'ALREADY_APPROVED', 'NGO already approved');

    await User.findByIdAndUpdate(req.params.id, { isApproved: true });
    await sendNGOApprovalEmail(user.email, user.name).catch(console.error);

    res.json({ success: true, message: 'NGO approved successfully' });
  } catch (err) { next(err); }
}

export async function getDashboardStats(req, res, next) {
  try {
    const [totalUsers, totalNGOs, pendingNGOs, totalListings, totalCollected] = await Promise.all([
      User.countDocuments({ role: 'donor' }),
      User.countDocuments({ role: 'ngo', isApproved: true }),
      User.countDocuments({ role: 'ngo', isApproved: false }),
      Listing.countDocuments(),
      Listing.countDocuments({ status: 'collected' }),
    ]);

    res.json({
      success: true,
      data: { totalDonors: totalUsers, totalNGOs, pendingNGOs, totalListings, totalCollected },
    });
  } catch (err) { next(err); }
}
