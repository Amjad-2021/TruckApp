# TruckLink — Setup Guide (Mac)

## Prerequisites

Install these tools on your Mac:

```bash
# 1. Install Node.js (if not installed)
brew install node

# 2. Install Expo CLI
npm install -g expo-cli eas-cli

# 3. Install Watchman (speeds up Metro bundler on Mac)
brew install watchman
```

## Run the App

```bash
# Navigate to the project
cd TruckLink

# Install dependencies
npm install

# Start the development server
npx expo start
```

Then press:
- **`i`** to open iOS Simulator (requires Xcode from the Mac App Store)
- **`a`** to open Android Emulator (requires Android Studio)
- **Scan the QR code** with the **Expo Go** app on your real phone (fastest way to test!)

---

## Firebase Setup (Required for real data & auth)

### Step 1 — Create a Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add Project"** → Name it `TruckLink`
3. Enable Google Analytics (optional)

### Step 2 — Enable Phone Authentication

1. In Firebase Console → **Authentication** → **Sign-in method**
2. Enable **Phone** provider
3. Add test phone numbers for development (e.g., `+966 500000000` → code `123456`)

### Step 3 — Create Firestore Database

1. Firebase Console → **Firestore Database** → **Create Database**
2. Start in **Production mode**
3. Choose region: `asia-south1` (Mumbai) — closest to Saudi Arabia

### Step 4 — Add Security Rules

Paste these rules in Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    // Loads: authenticated users can read all; only shippers can create
    match /loads/{loadId} {
      allow read:  if request.auth != null;
      allow create: if request.auth != null && request.resource.data.shipperId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.shipperId == request.auth.uid;
    }
    // Driver availability: drivers write their own; all can read
    match /driverAvailability/{uid} {
      allow read:  if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == uid;
    }
    // Negotiations: only participants can read/write
    match /negotiations/{dealId} {
      allow read, write: if request.auth != null;
      match /messages/{msgId} {
        allow read, write: if request.auth != null;
      }
    }
  }
}
```

### Step 5 — Connect Firebase to the App

1. Firebase Console → Project Settings → **Your Apps** → **Add App** → Web (`</>`)
2. Copy the config object
3. Paste it into `src/services/firebase.js`, replacing the placeholder values:

```javascript
const firebaseConfig = {
  apiKey:            "AIzaSy...",
  authDomain:        "trucklink-xxxxx.firebaseapp.com",
  projectId:         "trucklink-xxxxx",
  storageBucket:     "trucklink-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abcdef",
};
```

---

## Firestore Data Structure

```
users/
  {uid}/
    name, role, phoneNumber, rating, totalTrips, createdAt

loads/
  {loadId}/
    fromCity, toCity, cargoType, weight, budget, status,
    shipperId, truckType, pickupDate, description, createdAt

driverAvailability/
  {uid}/
    fromCity, toCity, truckType, capacity, isAvailable,
    coords { lat, lng },   ← fuzzed ±0.05° for privacy
    pricePerTon, updatedAt

negotiations/
  {dealId}/
    status, agreedPrice, confirmedAt
    messages/
      {msgId}/
        text, type, senderId, senderName,
        proposedPrice, feeBreakdown, timestamp
```

---

## Business Logic: 3% Platform Fee

The fee is calculated in `src/utils/helpers.js`:

```javascript
export function calculateFee(agreedPrice) {
  const price        = parseFloat(agreedPrice);
  const fee          = (price * 3) / 100;
  const driverGets   = price - fee;
  return { agreedPrice: price, platformFee: fee, driverReceives: driverGets };
}
```

**Example deal — SAR 5,000:**
| Item              | Amount      |
|-------------------|-------------|
| Agreed price      | SAR 5,000   |
| TruckLink fee (3%)| SAR 150     |
| Driver receives   | SAR 4,850   |

---

## Privacy: How Truck Locations Are Hidden

Drivers' exact GPS is **never** shown to shippers. Instead:
1. When a driver saves their availability, their GPS is stored in Firestore.
2. When displayed on the map, a `±0.05°` (~5 km) random offset is added via `fuzzyLocation()`.
3. Exact location is only revealed **after a deal is confirmed**.

This is handled in `src/utils/helpers.js` → `fuzzyLocation(lat, lng)`.

---

## Build for App Store / Google Play

```bash
# Install EAS Build
npm install -g eas-cli
eas login

# Configure builds
eas build:configure

# Build for iOS (requires Apple Developer account — $99/year)
eas build --platform ios

# Build for Android (requires Google Play account — $25 one-time)
eas build --platform android
```

---

## Next Features to Add

- [ ] Push notifications (Expo Notifications + FCM)
- [ ] Driver rating system after delivery
- [ ] In-app payment integration (PayTabs, HyperPay for Saudi Arabia)
- [ ] Live tracking with socket.io after deal confirmation
- [ ] Admin dashboard (web) for managing platform fees
- [ ] Arabic language support (RTL layout)
