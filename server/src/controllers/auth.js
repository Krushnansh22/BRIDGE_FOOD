import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.js';
import { createError } from '../middleware/errorHandler.js';

function generateTokens(userId, role) {
  const payload = { userId, role };
  const access = jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '15m' });
  const refresh = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret', { expiresIn: '7d' });
  return { access, refresh };
}

export async function register(req, res, next) {
  try {
    const { name, email, password, role, phone, ngoDetails } = req.body;
    const existing = await User.findOne({ email });
    if (existing) throw createError(409, 'EMAIL_EXISTS', 'Email already registered');

    const passwordHash = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const userData = {
      name, email, passwordHash, role,
      phone: phone || '',
      isVerified: process.env.NODE_ENV === 'development', // auto-verify in dev
      isApproved: role === 'donor', // donors auto-approved, NGOs need admin approval
      emailVerificationToken: verificationToken,
    };

    if (role === 'ngo' && ngoDetails) {
      userData.ngoDetails = ngoDetails;
    }

    const user = await User.create(userData);

    if (process.env.NODE_ENV !== 'development') {
      await sendVerificationEmail(email, verificationToken).catch(console.error);
    }

    const { access, refresh } = generateTokens(user._id, user.role);
    await User.findByIdAndUpdate(user._id, { $push: { refreshTokens: refresh } });

    res.status(201).json({
      success: true,
      data: {
        token: access,
        refreshToken: refresh,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified, isApproved: user.isApproved },
      },
      message: role === 'ngo' ? 'Registration successful. Awaiting admin approval.' : 'Registration successful.',
    });
  } catch (err) { next(err); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw createError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw createError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');

    const { access, refresh } = generateTokens(user._id, user.role);
    await User.findByIdAndUpdate(user._id, { $push: { refreshTokens: refresh } });

    res.json({
      success: true,
      data: {
        token: access,
        refreshToken: refresh,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified, isApproved: user.isApproved, stats: user.stats },
      },
    });
  } catch (err) { next(err); }
}

export async function refreshToken(req, res, next) {
  try {
    const { refreshToken: token } = req.body;
    if (!token) throw createError(401, 'NO_TOKEN', 'Refresh token required');

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret');
    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshTokens.includes(token)) {
      throw createError(401, 'INVALID_TOKEN', 'Invalid refresh token');
    }

    // Rotate token
    const { access, refresh: newRefresh } = generateTokens(user._id, user.role);
    await User.findByIdAndUpdate(user._id, {
      $pull: { refreshTokens: token },
      $push: { refreshTokens: newRefresh },
    });

    res.json({ success: true, data: { token: access, refreshToken: newRefresh } });
  } catch (err) { next(err); }
}

export async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    await User.findByIdAndUpdate(req.user._id, { $pull: { refreshTokens: refreshToken } });
    res.json({ success: true, message: 'Logged out' });
  } catch (err) { next(err); }
}

export async function verifyEmail(req, res, next) {
  try {
    const { token } = req.params;
    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) throw createError(400, 'INVALID_TOKEN', 'Invalid verification token');

    await User.findByIdAndUpdate(user._id, { isVerified: true, emailVerificationToken: null });
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (err) { next(err); }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: true, message: 'If that email exists, a reset link was sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    await User.findByIdAndUpdate(user._id, {
      passwordResetToken: token,
      passwordResetExpires: new Date(Date.now() + 3600000),
    });

    await sendPasswordResetEmail(email, token).catch(console.error);
    res.json({ success: true, message: 'If that email exists, a reset link was sent.' });
  } catch (err) { next(err); }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });
    if (!user) throw createError(400, 'INVALID_TOKEN', 'Invalid or expired reset token');

    const passwordHash = await bcrypt.hash(password, 12);
    await User.findByIdAndUpdate(user._id, {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
      refreshTokens: [],
    });

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) { next(err); }
}
