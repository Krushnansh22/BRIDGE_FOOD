import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '', maxlength: 500 },
  category: {
    type: String,
    enum: ['cooked', 'raw', 'packaged', 'bakery', 'other'],
    required: true,
  },
  quantity: { type: Number, required: true, min: 0.1 },
  quantityUnit: { type: String, enum: ['kg', 'servings'], default: 'kg' },
  preparedAt: { type: Date, required: true },
  storageType: {
    type: String,
    enum: ['room_temp', 'refrigerated', 'frozen'],
    required: true,
  },
  expiresAt: { type: Date },
  urgency: { type: String, enum: ['high', 'medium', 'low', 'expired'], default: 'medium' },
  urgencyScore: { type: Number, default: 50, min: 0, max: 100 },
  status: {
    type: String,
    enum: ['available', 'requested', 'collected', 'expired'],
    default: 'available',
  },
  pickupAddress: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
  },
  pickupWindowStart: { type: Date },
  pickupWindowEnd: { type: Date },
  activeRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },
  requestCount: { type: Number, default: 0 },
  expiredAt: { type: Date },
}, { timestamps: true });

listingSchema.index({ location: '2dsphere' });
listingSchema.index({ status: 1, urgencyScore: -1 });
listingSchema.index({ donor: 1, createdAt: -1 });
listingSchema.index({ expiresAt: 1 });

export default mongoose.model('Listing', listingSchema);
