import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'collected', 'cancelled'],
    default: 'pending',
  },
  message: { type: String, default: '' },
  pickedUpAt: { type: Date },
}, { timestamps: true });

requestSchema.index({ listing: 1, status: 1 });
requestSchema.index({ ngo: 1, createdAt: -1 });
requestSchema.index({ donor: 1, createdAt: -1 });

export default mongoose.model('Request', requestSchema);
