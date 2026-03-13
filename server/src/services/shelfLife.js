const BASE_HOURS = {
  cooked: { room_temp: 2, refrigerated: 72, frozen: 720 },
  raw: { room_temp: 4, refrigerated: 48, frozen: 2160 },
  packaged: { room_temp: 8760, refrigerated: 8760, frozen: 17520 },
  bakery: { room_temp: 24, refrigerated: 120, frozen: 720 },
  other: { room_temp: 4, refrigerated: 48, frozen: 720 },
};

export function estimateExpiry(category, storageType, preparedAt) {
  const baseHours = BASE_HOURS[category]?.[storageType] ?? 4;
  return new Date(new Date(preparedAt).getTime() + baseHours * 3600 * 1000);
}

export function computeUrgency(expiresAt) {
  const hoursLeft = (new Date(expiresAt) - Date.now()) / 3600000;
  if (hoursLeft <= 0) return { urgency: 'expired', urgencyScore: 100 };
  if (hoursLeft <= 3) return { urgency: 'high', urgencyScore: 90 };
  if (hoursLeft <= 12) return { urgency: 'high', urgencyScore: 70 };
  if (hoursLeft <= 24) return { urgency: 'medium', urgencyScore: 50 };
  if (hoursLeft <= 72) return { urgency: 'medium', urgencyScore: 30 };
  return { urgency: 'low', urgencyScore: 10 };
}

export function computeShelfLife(category, storageType, preparedAt) {
  const expiresAt = estimateExpiry(category, storageType, preparedAt);
  const { urgency, urgencyScore } = computeUrgency(expiresAt);
  return { expiresAt, urgency, urgencyScore };
}
