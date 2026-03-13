import { Expo } from 'expo-server-sdk';
import { Notification } from '../models/index.js';
import User from '../models/User.js';

const expo = new Expo();

export async function sendPush(expoPushToken, title, body, data = {}) {
  if (!expoPushToken || !Expo.isExpoPushToken(expoPushToken)) return;
  try {
    const messages = [{ to: expoPushToken, title, body, data, sound: 'default' }];
    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk);
    }
  } catch (err) {
    console.error('Push notification error:', err.message);
  }
}

export async function createNotification(userId, type, title, body, data = {}) {
  try {
    await Notification.create({ user: userId, type, title, body, data });
    const user = await User.findById(userId).select('expoPushToken');
    if (user?.expoPushToken) {
      await sendPush(user.expoPushToken, title, body, data);
    }
  } catch (err) {
    console.error('Create notification error:', err.message);
  }
}

export async function notifyNearbyNGOs(listing, type, title, body) {
  try {
    const ngos = await User.find({
      role: 'ngo',
      isApproved: true,
      location: {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: listing.location.coordinates },
          $maxDistance: 15000, // 15km
        },
      },
    }).select('_id expoPushToken');

    for (const ngo of ngos) {
      await createNotification(ngo._id, type, title, body, { listingId: listing._id });
    }
  } catch (err) {
    console.error('Notify nearby NGOs error:', err.message);
  }
}

export async function sendUrgentNotifications(listing) {
  await notifyNearbyNGOs(
    listing,
    'urgent_listing',
    '⚠️ Urgent Food Available',
    `${listing.title} needs pickup soon! Only a few hours left.`
  );
}
