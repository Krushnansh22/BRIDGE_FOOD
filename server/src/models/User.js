import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['donor', 'ngo', 'admin'], required: true },
  phone: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
  ngoDetails: {
    registrationNumber: { type: String, default: '' },
    address: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
    address: { type: String, default: '' },
  },
  expoPushToken: { type: String, default: '' },
  stats: {
    totalDonated: { type: Number, default: 0 },
    totalCollected: { type: Number, default: 0 },
    mealsCount: { type: Number, default: 0 },
  },
  emailVerificationToken: { type: String },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  refreshTokens: [{ type: String }],
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });
userSchema.index({ role: 1 });

export default mongoose.model('User', userSchema);
