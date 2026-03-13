import { Notification } from '../models/index.js';

export async function getNotifications(req, res, next) {
  try {
    const { page = 1, limit = 30 } = req.query;
    const lim = Math.min(parseInt(limit), 50);
    const skip = (parseInt(page) - 1) * lim;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip).limit(lim),
      Notification.countDocuments({ user: req.user._id }),
      Notification.countDocuments({ user: req.user._id, isRead: false }),
    ]);

    res.json({
      success: true,
      data: notifications,
      pagination: { page: parseInt(page), limit: lim, total, totalPages: Math.ceil(total / lim) },
      unreadCount,
    });
  } catch (err) { next(err); }
}

export async function markAllRead(req, res, next) {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) { next(err); }
}

export async function markRead(req, res, next) {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Notification not found' } });
    res.json({ success: true, data: notif });
  } catch (err) { next(err); }
}
