import { z } from 'zod';

export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const messages = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: messages } });
    }
    req.body = result.data;
    next();
  };
}

export const schemas = {
  register: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(['donor', 'ngo']),
    phone: z.string().optional(),
    ngoDetails: z.object({
      registrationNumber: z.string().min(1),
      address: z.string().min(5),
      description: z.string().min(10),
    }).optional(),
  }).refine(data => {
    if (data.role === 'ngo' && !data.ngoDetails) return false;
    return true;
  }, { message: 'NGO registration details required' }),

  login: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),

  createListing: z.object({
    title: z.string().min(3).max(100),
    description: z.string().max(500).optional(),
    category: z.enum(['cooked', 'raw', 'packaged', 'bakery', 'other']),
    quantity: z.number().positive(),
    quantityUnit: z.enum(['kg', 'servings']).default('kg'),
    preparedAt: z.string().datetime(),
    storageType: z.enum(['room_temp', 'refrigerated', 'frozen']),
    pickupAddress: z.string().min(5),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    pickupWindowStart: z.string().datetime().optional(),
    pickupWindowEnd: z.string().datetime().optional(),
  }),

  createRequest: z.object({
    listingId: z.string().min(1),
    message: z.string().max(500).optional(),
  }),

  createReview: z.object({
    requestId: z.string().min(1),
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(500).optional(),
  }),

  updateProfile: z.object({
    name: z.string().min(2).max(100).optional(),
    phone: z.string().optional(),
  }),

  updateLocation: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    address: z.string().optional(),
  }),

  forgotPassword: z.object({ email: z.string().email() }),

  resetPassword: z.object({
    token: z.string().min(1),
    password: z.string().min(8),
  }),
};
