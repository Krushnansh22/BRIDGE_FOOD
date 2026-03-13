import axios from 'axios';

const NOMINATIM = 'https://nominatim.openstreetmap.org';
const HEADERS = { 'User-Agent': 'FoodBridge/1.0 contact@foodbridge.app' };

let lastRequestTime = 0;
async function rateLimit() {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < 1100) await new Promise(r => setTimeout(r, 1100 - elapsed));
  lastRequestTime = Date.now();
}

export async function addressToCoords(address) {
  await rateLimit();
  const { data } = await axios.get(`${NOMINATIM}/search`, {
    params: { q: address, format: 'json', limit: 1 },
    headers: HEADERS,
    timeout: 10000,
  });
  if (!data.length) throw new Error('Address not found');
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

export async function coordsToAddress(lat, lng) {
  await rateLimit();
  const { data } = await axios.get(`${NOMINATIM}/reverse`, {
    params: { lat, lon: lng, format: 'json' },
    headers: HEADERS,
    timeout: 10000,
  });
  return data.display_name || `${lat}, ${lng}`;
}
