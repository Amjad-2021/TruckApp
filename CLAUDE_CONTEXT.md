# TruckLink — Claude Session Context

## Key Info
- **GitHub username:** Amjad-2021
- **Frontend repo:** https://github.com/Amjad-2021/TruckApp.git
- **Backend repo:** https://github.com/Amjad-2021/trucklink-backend.git
- **Backend live URL:** https://trucklink-backend-production.up.railway.app
- **Old crashed service:** https://truckapp-production-2be0.up.railway.app (ignore this)
- **Mac frontend path:** /Users/amjad/Documents/TruckLink MVP/TruckLink/
- **Mac backend path:** /Users/amjad/Documents/trucklink-backend/

## Stack
- React Native + Expo (iOS + Android + Web)
- Node.js + Express + MySQL on Railway
- JWT auth stored in AsyncStorage (key: `trucklink_token`)
- No Firebase anymore — fully replaced

## Railway Setup
- Service: trucklink-backend → connected to Amjad-2021/trucklink-backend
- MySQL: Online, database `trucklink` created with full schema + seed data
- Variables set: MYSQL_HOST, MYSQL_PORT, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD, JWT_SECRET, NODE_ENV
- Public domain: trucklink-backend-production.up.railway.app ✅

## Backend API Routes
- POST /api/auth/register
- POST /api/auth/login
- GET  /api/drivers, /api/drivers/me, /api/drivers/:id
- POST /api/drivers, PUT /api/drivers/:id
- GET  /api/loads, /api/loads/mine, /api/loads/:id
- POST /api/loads
- PUT  /api/loads/:id/status, /api/loads/:id/accept
- GET  /api/messages/:loadId
- POST /api/messages/:loadId
- GET/POST /api/reviews

## Git workflow
- Frontend: cd "/Users/amjad/Documents/TruckLink MVP/TruckLink"
- Backend:  cd "/Users/amjad/Documents/trucklink-backend"
- git add -A && git commit -m "..." && git push
- (force push if rejected: git push --force)
- Railway auto-deploys backend on every push to main

## What's Done
- All screens replaced: MapScreen, BrowseLoads, PostLoad, Orders,
  DriverAvailability, NegotiationScreen, HomeScreen, ProfileScreen,
  LoginScreen, OTPScreen, SplashScreen, RoleSelectionScreen
- UserContext, LanguageContext, AppNavigator, App.js all replaced
- 8-language support (ar, en, ur, fr, hi, bn, sw, so)
- api.js points to live Railway backend URL
- Backend deployed and online with MySQL schema + seed data
- Both repos pushed to GitHub

## What's Next
1. Wire up real SMS OTP via Unifonic (backend routes/auth.js)
2. Change JWT_SECRET from placeholder to a strong random string in Railway
3. EAS Build setup for App Store
4. App Store assets (icon 1024x1024, screenshots, Arabic description)
5. TestFlight beta before full App Store submission
6. Delete or fix the old crashed TruckApp service on Railway
