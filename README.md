# 🌱 FoodBridge

**Smart Food Donation Platform** — Connecting surplus food donors with verified NGOs in real time.

---

## Quick Start (2 terminals)

### Terminal 1 — Backend

```bash
cd server
cp .env.example .env        # edit MONGO_URI (see below)
npm install
npm run seed                # creates 5 test users + 5 listings
npm run dev                 # starts on http://localhost:5000
```

### Terminal 2 — Mobile App

```bash
cd apps/mobile
npm install

# ⚠️  IMPORTANT: edit constants/index.ts
# Change API_BASE_URL to your machine's local IP (not localhost)
# e.g.  http://192.168.1.42:5000/api/v1
# Find your IP:  ifconfig | grep "inet " (Mac/Linux)  or  ipconfig (Windows)

npx expo start              # scan QR with Expo Go app on your phone
# OR press 'a' for Android emulator, 'i' for iOS simulator
```

---

## MongoDB Setup

**Option A — Local (fastest for demo)**
```
MONGO_URI=mongodb://localhost:27017/foodbridge
```
Install MongoDB Community: https://www.mongodb.com/try/download/community

**Option B — Atlas Free Tier (no install)**
1. Sign up at https://cloud.mongodb.com (free)
2. Create a free M0 cluster
3. Get connection string and set in `.env`

---

## Test Credentials (after `npm run seed`)

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Donor | `donor@foodbridge.app` | `password123` | Spice Garden Restaurant |
| Donor 2 | `donor2@foodbridge.app` | `password123` | Grand Catering Services |
| NGO | `ngo@foodbridge.app` | `password123` | ✅ Approved — full access |
| NGO 2 | `ngo2@foodbridge.app` | `password123` | ⏳ Pending approval |
| Admin | `admin@foodbridge.app` | `password123` | Can approve NGOs |

The login screen also has **quick demo buttons** for one-tap login.

---

## Feature Walkthrough (Demo Script)

### As Donor
1. Login as `donor@foodbridge.app`
2. Tap **➕ Donate** → fill in food details → tap **📍 Use My Current Location** → Submit
3. Tap **📋 My Listings** → tap a listing to see incoming requests
4. Approve or reject NGO pickup requests

### As NGO
1. Login as `ngo@foodbridge.app`
2. Tap **🔍 Discover** → see listings sorted by urgency near your location
3. Tap a listing → tap **📬 Request Pickup**
4. Tap **📋 My Requests** → once approved, tap **✅ Mark as Collected**
5. Tap **🗺️ Map** to see all listings plotted on a live map

### Admin Flow
- Login as `admin@foodbridge.app`
- Use the API: `PATCH /api/v1/admin/users/:id/approve` to approve pending NGOs
- Or use `GET /api/v1/admin/users?role=ngo&isApproved=false` to list pending NGOs

---

## API Reference

**Base URL:** `http://localhost:5000/api/v1`

All endpoints return: `{ success: true, data: <payload> }` or `{ success: false, error: { code, message } }`

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register donor or NGO |
| POST | `/auth/login` | Login → returns JWT + refresh token |
| POST | `/auth/refresh` | Rotate refresh token |
| POST | `/auth/logout` | Invalidate refresh token |

### Listings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/listings` | JWT | Browse all available listings |
| GET | `/listings/nearby?lat=&lng=&radiusKm=` | JWT (NGO) | Geo-sorted nearby listings |
| GET | `/listings/my` | JWT (Donor) | Donor's own listings |
| POST | `/listings` | JWT (Donor) | Create listing |
| GET | `/listings/:id` | JWT | Listing detail |
| DELETE | `/listings/:id` | JWT (Donor) | Delete own listing |

### Requests
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/requests` | JWT (NGO) | Request a pickup |
| GET | `/requests/my` | JWT | My requests |
| PATCH | `/requests/:id/approve` | JWT (Donor) | Approve request |
| PATCH | `/requests/:id/reject` | JWT (Donor) | Reject request |
| PATCH | `/requests/:id/collect` | JWT (NGO) | Mark as collected |
| PATCH | `/requests/:id/cancel` | JWT (NGO) | Cancel request |

### Health Check
```
GET /health → { success: true, message: "FoodBridge API running" }
```

---

## Architecture

```
foodbridge/
├── server/                   # Node.js + Express backend
│   └── src/
│       ├── config/db.js      # MongoDB connection
│       ├── models/           # Mongoose schemas (User, Listing, Request, Review, Notification)
│       ├── controllers/      # Business logic (auth, listings, requests, users, notifications, admin, reviews)
│       ├── routes/           # Express routers
│       ├── middleware/       # JWT auth, Zod validation, error handler
│       ├── services/         # Shelf-life engine, Expo push notifications, email
│       ├── jobs/             # Hourly cron (urgency refresh + auto-expire)
│       └── utils/            # Nominatim geocoding, DB seeder
│
└── apps/mobile/              # React Native + Expo
    ├── app/
    │   ├── (auth)/           # Login, Register, Forgot Password
    │   ├── (donor)/          # My Listings, Create Listing, Listing Detail + Requests
    │   ├── (ngo)/            # Discovery Feed, Map, Listing Detail, My Requests
    │   └── (shared)/         # Notifications, Profile
    ├── components/           # ListingCard, UI primitives (Button, Input, Badge, etc.)
    ├── store/                # Zustand auth store
    ├── services/             # Axios API client with auto-refresh
    ├── utils/                # Date helpers, notification hook
    └── constants/            # Colors, categories, API URL
```

### Key Decisions

| Decision | Reason |
|----------|--------|
| No image upload | Removes Cloudinary dependency — cleaner demo, works offline |
| JWT auto-refresh in Axios interceptor | Transparent token rotation, no re-login on expiry |
| Nominatim rate limiter (1 req/s) | Respects OSM usage policy |
| Donors auto-approved; NGOs require admin | Security — only verified charities access donations |
| `isVerified: true` in dev mode | No SMTP config needed to demo |
| Seed data uses Mumbai coordinates | Geo-nearby query works immediately out of the box |
| Rule-based shelf-life engine | Zero external AI API needed; deterministic and auditable |

---

## Environment Variables

**`server/.env`**
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/foodbridge
JWT_SECRET=replace_with_random_256bit_string
JWT_REFRESH_SECRET=replace_with_different_random_256bit_string

# Optional – email (skip for demo; emails are logged to console in dev)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
```

---

## Deployment

### Backend → Railway (free tier)
1. Push `server/` to GitHub
2. New Railway project → Deploy from GitHub
3. Add environment variables in Railway dashboard
4. MongoDB: Atlas free M0 cluster

### Mobile → Expo Go (instant demo)
```bash
npx expo start   # share QR code — no build needed
```

### Mobile → Standalone APK (EAS)
```bash
npm install -g eas-cli
eas build --platform android --profile preview
```
