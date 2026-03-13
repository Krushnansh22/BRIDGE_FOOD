import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Listing from '../models/Listing.js';
import { computeShelfLife } from '../services/shelfLife.js';

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/foodbridge');
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([User.deleteMany({}), Listing.deleteMany({})]);
  console.log('Cleared existing data');

  const hash = await bcrypt.hash('password123', 12);

  // Create admin
  const admin = await User.create({
    name: 'Platform Admin',
    email: 'admin@foodbridge.app',
    passwordHash: hash,
    role: 'admin',
    isVerified: true,
    isApproved: true,
  });

  // Create donors
  const donor1 = await User.create({
    name: 'Spice Garden Restaurant',
    email: 'donor@foodbridge.app',
    passwordHash: hash,
    role: 'donor',
    isVerified: true,
    isApproved: true,
    phone: '+91 98765 43210',
    location: { type: 'Point', coordinates: [72.8777, 19.0760], address: 'Mumbai, Maharashtra' },
    stats: { totalDonated: 45, mealsCount: 180, totalCollected: 0 },
  });

  const donor2 = await User.create({
    name: 'Grand Catering Services',
    email: 'donor2@foodbridge.app',
    passwordHash: hash,
    role: 'donor',
    isVerified: true,
    isApproved: true,
    phone: '+91 98765 43211',
    location: { type: 'Point', coordinates: [72.8856, 19.0822], address: 'Andheri, Mumbai' },
    stats: { totalDonated: 120, mealsCount: 480, totalCollected: 0 },
  });

  // Create NGOs
  const ngo1 = await User.create({
    name: 'Hunger Relief Foundation',
    email: 'ngo@foodbridge.app',
    passwordHash: hash,
    role: 'ngo',
    isVerified: true,
    isApproved: true,
    phone: '+91 98765 43212',
    ngoDetails: {
      registrationNumber: 'NGO-MH-2019-00123',
      address: 'Dharavi, Mumbai',
      description: 'Serving hot meals to underprivileged communities since 2019.',
    },
    location: { type: 'Point', coordinates: [72.8559, 19.0433], address: 'Dharavi, Mumbai' },
    stats: { totalCollected: 200, mealsCount: 800, totalDonated: 0 },
  });

  const ngo2 = await User.create({
    name: 'Annapurna Trust',
    email: 'ngo2@foodbridge.app',
    passwordHash: hash,
    role: 'ngo',
    isVerified: true,
    isApproved: false, // Pending approval for demo
    phone: '+91 98765 43213',
    ngoDetails: {
      registrationNumber: 'NGO-MH-2022-00456',
      address: 'Kurla, Mumbai',
      description: 'Community kitchen providing meals to construction workers and daily wage earners.',
    },
    location: { type: 'Point', coordinates: [72.8791, 19.0728], address: 'Kurla, Mumbai' },
    stats: { totalCollected: 0, mealsCount: 0, totalDonated: 0 },
  });

  // Create listings
  const now = new Date();
  const listingsData = [
    {
      donor: donor1._id,
      title: 'Leftover Biryani & Dal',
      description: 'Fresh biryani and yellow dal prepared this afternoon. About 30 servings available.',
      category: 'cooked',
      quantity: 30,
      quantityUnit: 'servings',
      preparedAt: new Date(now.getTime() - 1 * 3600000), // 1 hour ago
      storageType: 'room_temp',
      pickupAddress: 'Bandra West, Mumbai',
      location: { type: 'Point', coordinates: [72.8277, 19.0596] },
    },
    {
      donor: donor1._id,
      title: 'Assorted Dinner Rolls & Bread',
      description: 'Freshly baked rolls from this morning. Best consumed today.',
      category: 'bakery',
      quantity: 8,
      quantityUnit: 'kg',
      preparedAt: new Date(now.getTime() - 4 * 3600000), // 4 hours ago
      storageType: 'room_temp',
      pickupAddress: 'Bandra West, Mumbai',
      location: { type: 'Point', coordinates: [72.8277, 19.0596] },
    },
    {
      donor: donor2._id,
      title: 'Paneer Butter Masala + Rice',
      description: 'Catering surplus from a corporate lunch. Refrigerated immediately after the event.',
      category: 'cooked',
      quantity: 50,
      quantityUnit: 'servings',
      preparedAt: new Date(now.getTime() - 3 * 3600000),
      storageType: 'refrigerated',
      pickupAddress: 'Andheri East, Mumbai',
      location: { type: 'Point', coordinates: [72.8697, 19.1148] },
    },
    {
      donor: donor2._id,
      title: 'Mixed Vegetable Curry',
      description: 'Wholesome mixed veg curry with chapatis. About 20kg available.',
      category: 'cooked',
      quantity: 20,
      quantityUnit: 'kg',
      preparedAt: new Date(now.getTime() - 6 * 3600000),
      storageType: 'refrigerated',
      pickupAddress: 'Andheri East, Mumbai',
      location: { type: 'Point', coordinates: [72.8697, 19.1148] },
    },
    {
      donor: donor1._id,
      title: 'Packaged Biscuits & Snacks',
      description: 'Factory-sealed biscuit packets, unused from an event. Expiry date next month.',
      category: 'packaged',
      quantity: 15,
      quantityUnit: 'kg',
      preparedAt: new Date(now.getTime() - 48 * 3600000),
      storageType: 'room_temp',
      pickupAddress: 'Bandra West, Mumbai',
      location: { type: 'Point', coordinates: [72.8277, 19.0596] },
    },
  ];

  for (const data of listingsData) {
    const { expiresAt, urgency, urgencyScore } = computeShelfLife(data.category, data.storageType, data.preparedAt);
    await Listing.create({ ...data, expiresAt, urgency, urgencyScore, status: 'available' });
  }

  console.log('✅ Seeded successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('  Donor:   donor@foodbridge.app   / password123');
  console.log('  Donor2:  donor2@foodbridge.app  / password123');
  console.log('  NGO:     ngo@foodbridge.app     / password123  (approved)');
  console.log('  NGO2:    ngo2@foodbridge.app    / password123  (pending)');
  console.log('  Admin:   admin@foodbridge.app   / password123');

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
