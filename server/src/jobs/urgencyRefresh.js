import cron from 'node-cron';
import Listing from '../models/Listing.js';
import { computeUrgency } from '../services/shelfLife.js';
import { sendUrgentNotifications } from '../services/notifications.js';

// Run every hour
cron.schedule('0 * * * *', async () => {
  try {
    console.log('[Cron] Running urgency refresh...');

    // Expire listings past their expiresAt
    const expiredResult = await Listing.updateMany(
      { status: { $in: ['available', 'requested'] }, expiresAt: { $lte: new Date() } },
      { $set: { status: 'expired', expiredAt: new Date() } }
    );
    if (expiredResult.modifiedCount > 0) {
      console.log(`[Cron] Expired ${expiredResult.modifiedCount} listings`);
    }

    // Recompute urgency for still-active listings
    const listings = await Listing.find({ status: 'available' });
    for (const listing of listings) {
      const { urgency, urgencyScore } = computeUrgency(listing.expiresAt);
      const changed = listing.urgency !== urgency;
      listing.urgency = urgency;
      listing.urgencyScore = urgencyScore;
      await listing.save();

      if (changed && urgency === 'high') {
        await sendUrgentNotifications(listing).catch(console.error);
      }
    }

    console.log(`[Cron] Refreshed urgency for ${listings.length} listings`);
  } catch (err) {
    console.error('[Cron] Error in urgency refresh:', err.message);
  }
});

console.log('✅ Urgency refresh cron job scheduled');
