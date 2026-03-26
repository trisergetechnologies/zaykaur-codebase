# Frontend authentication

## Implemented (MVP)

- **Email + password:** Sign in and Sign up forms call Gateway → Server `/auth/login` and `/auth/register`. Token and user are stored in Zustand (persisted) and `localStorage` for the token.
- **Protected routes:** Cart, Checkout, My Account, My Orders require a valid token; otherwise the user is redirected to `/sign-in?redirect=...`.
- **Profile:** My Account loads `/user/me` and allows editing name and phone via PUT `/user/me`.

## Planned (documented for later)

- **Google OAuth:** Buttons are present; implementation will use OAuth keys (e.g. `NEXT_PUBLIC_GOOGLE_CLIENT_ID` and server-side verification). See [Setup](setup/README.md) for env vars. When keys are added, wire the buttons to your OAuth flow.
- **Phone / email OTP:** Architecture supports adding a separate “Send OTP” and “Verify OTP” flow (e.g. `/auth/send-otp`, `/auth/verify-otp`) and optional “Sign in with OTP” without changing the rest of the auth flow.

## Env

- `NEXT_PUBLIC_API_URL` — Base URL of the API (Gateway). Example: `http://localhost:4000`.

## Token storage

- Token is stored in `localStorage` under the key `zaykaur_token` and in the auth Zustand store (persisted). On load, if a token exists, the app calls `/user/me` to refresh the user object.
