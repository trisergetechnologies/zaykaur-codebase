# Zaykaur Buyer App (React Native Expo)

Production-ready React Native Expo app for buyers. Uses the same backend (API gateway + server) as the web frontend.

## Setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL` to your gateway URL (e.g. `http://localhost:4000` or `http://<your-ip>:4000` for device).
3. Start the backend (server + api-gateway) and ensure the DB is seeded.
4. Run the app: `npm start` then choose iOS/Android/Web.

## Features

- **Guest browsing**: Home, Shop, Product detail. Sign in to add to cart and checkout.
- **Auth**: Sign In / Sign Up with JWT; persisted session.
- **Products**: List, search, category filter, product detail with variant selectors.
- **Cart**: Add/remove items, order summary, proceed to checkout (requires sign in).
- **Checkout**: Select delivery address, place order (COD).
- **Account**: Profile, My Orders, Addresses, Sign out.

## API

All requests use `/api/v1` and the same endpoints as the web app. Token is stored in AsyncStorage and sent as `Authorization: Bearer <token>`.

## Demo

1. Open app → browse Home/Shop.
2. Sign in (tap Sign in on Home, or open Cart/Account).
3. Add product to cart → Cart → Checkout → place order.
4. View order in Account → My Orders.
