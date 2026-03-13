// Mock data for demo purposes

export const FOOD_EMOJIS = {
  cooked: '🍛',
  raw: '🥦',
  packaged: '📦',
  bakery: '🥐',
  other: '🍽️',
};

export const MOCK_LISTINGS = [
  {
    _id: 'lst1',
    title: 'Leftover Biryani',
    description: 'Freshly made chicken biryani from corporate lunch event. Approx 40 servings.',
    category: 'cooked',
    quantity: 40,
    quantityUnit: 'servings',
    preparedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    storageType: 'room_temp',
    urgency: 'high',
    urgencyScore: 90,
    status: 'available',
    pickupAddress: '12 MG Road, Bangalore',
    donor: { _id: 'u1', name: 'Hotel Taj Residency' },
    expiresAt: new Date(Date.now() + 1 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    _id: 'lst2',
    title: 'Assorted Bread Rolls',
    description: 'Freshly baked dinner rolls, still warm. From a wedding event.',
    category: 'bakery',
    quantity: 120,
    quantityUnit: 'servings',
    preparedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    storageType: 'room_temp',
    urgency: 'medium',
    urgencyScore: 50,
    status: 'available',
    pickupAddress: '45 Residency Road, Bangalore',
    donor: { _id: 'u2', name: 'Zara Banquet Hall' },
    expiresAt: new Date(Date.now() + 18 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    _id: 'lst3',
    title: 'Fresh Vegetables Pack',
    description: 'Unused raw vegetables — carrots, beans, cabbage, potatoes.',
    category: 'raw',
    quantity: 15,
    quantityUnit: 'kg',
    preparedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    storageType: 'refrigerated',
    urgency: 'low',
    urgencyScore: 30,
    status: 'requested',
    pickupAddress: '8 Commercial Street, Bangalore',
    donor: { _id: 'u3', name: 'FreshMart Superstore' },
    expiresAt: new Date(Date.now() + 60 * 3600000).toISOString(),
    activeRequest: 'req2',
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    _id: 'lst4',
    title: 'Dal Makhani & Rotis',
    description: 'Office canteen surplus. 25 full meals available for immediate pickup.',
    category: 'cooked',
    quantity: 25,
    quantityUnit: 'servings',
    preparedAt: new Date(Date.now() - 1.5 * 3600000).toISOString(),
    storageType: 'refrigerated',
    urgency: 'high',
    urgencyScore: 70,
    status: 'available',
    pickupAddress: '77 Indiranagar, Bangalore',
    donor: { _id: 'u1', name: 'Hotel Taj Residency' },
    expiresAt: new Date(Date.now() + 10 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 1.5 * 3600000).toISOString(),
  },
  {
    _id: 'lst5',
    title: 'Packaged Biscuits & Snacks',
    description: 'Unopened snack packs from conference goodie bags. Expiry 6 months away.',
    category: 'packaged',
    quantity: 200,
    quantityUnit: 'servings',
    preparedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    storageType: 'room_temp',
    urgency: 'low',
    urgencyScore: 10,
    status: 'collected',
    pickupAddress: '23 Whitefield, Bangalore',
    donor: { _id: 'u3', name: 'FreshMart Superstore' },
    expiresAt: new Date(Date.now() + 4000 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
];

export const MOCK_REQUESTS = [
  {
    _id: 'req1',
    listing: MOCK_LISTINGS[0],
    ngo: { _id: 'ngo1', name: 'Feeding India Foundation', ngoDetails: { registrationNumber: 'NGO/2019/FIF' } },
    donor: { _id: 'u1', name: 'Hotel Taj Residency' },
    status: 'pending',
    message: 'We can pick up within 30 minutes. We serve 200 families daily.',
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    _id: 'req2',
    listing: MOCK_LISTINGS[2],
    ngo: { _id: 'ngo1', name: 'Feeding India Foundation', ngoDetails: { registrationNumber: 'NGO/2019/FIF' } },
    donor: { _id: 'u3', name: 'FreshMart Superstore' },
    status: 'approved',
    message: 'Vegetables needed for our community kitchen.',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    _id: 'req3',
    listing: MOCK_LISTINGS[4],
    ngo: { _id: 'ngo1', name: 'Feeding India Foundation', ngoDetails: { registrationNumber: 'NGO/2019/FIF' } },
    donor: { _id: 'u3', name: 'FreshMart Superstore' },
    status: 'collected',
    message: '',
    pickedUpAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 3600000).toISOString(),
  },
];

export const MOCK_NOTIFICATIONS = [
  { _id: 'n1', type: 'request_received', title: 'New pickup request', body: 'Feeding India Foundation wants to pick up "Leftover Biryani"', isRead: false, createdAt: new Date(Date.now() - 30 * 60000).toISOString() },
  { _id: 'n2', type: 'urgent_listing', title: '🔴 Urgent listing nearby', body: 'Leftover Biryani from Hotel Taj Residency expires in 1 hour', isRead: false, createdAt: new Date(Date.now() - 45 * 60000).toISOString() },
  { _id: 'n3', type: 'request_approved', title: 'Request approved!', body: 'FreshMart Superstore approved your pickup of Fresh Vegetables', isRead: true, createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
  { _id: 'n4', type: 'new_listing', title: 'New listing nearby', body: 'Assorted Bread Rolls available 2.1 km away', isRead: true, createdAt: new Date(Date.now() - 5 * 3600000).toISOString() },
];

export function getUrgencyLabel(u) {
  return u === 'high' ? '🔴 High' : u === 'medium' ? '🟡 Medium' : '🟢 Low';
}

export function formatTimeLeft(expiresAt) {
  const ms = new Date(expiresAt) - Date.now();
  if (ms <= 0) return { label: 'Expired', cls: 'urgent' };
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h === 0) return { label: `${m}m left`, cls: 'urgent' };
  if (h < 12) return { label: `${h}h ${m}m left`, cls: h < 3 ? 'urgent' : 'warning' };
  return { label: `${h}h left`, cls: 'ok' };
}

export function formatRelative(dateStr) {
  const ms = Date.now() - new Date(dateStr);
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export const NOTIF_ICONS = {
  new_listing: '🍽️',
  urgent_listing: '🔴',
  request_received: '📥',
  request_approved: '✅',
  request_rejected: '❌',
  listing_expired: '⏰',
};
