# Users and seller profiles

## Collections

- **users** — All actors: customers, sellers, admin, staff.
- **seller_profiles** — Seller-only fields (shop, legal, settlement). One per seller user.

Addresses are **embedded** in `users` (array of address subdocuments). One address can be marked `isDefault` for checkout.

---

## users

Stores identity, role, and profile for customers, sellers, admin, and staff.

### Schema

| Field | Type | Required | Index | Use |
|-------|------|----------|-------|-----|
| `name` | String | yes | — | Display name; max 100 chars |
| `email` | String | yes | unique | Login; lowercase |
| `phone` | String | no | unique (sparse) | Optional; sparse so nulls don’t conflict |
| `password` | String | no* | — | Hashed (bcrypt); `select: false`; *required for non-OAuth |
| `role` | String | yes | yes | `customer` \| `seller` \| `admin` \| `staff`; default `customer` |
| `avatar` | String | no | — | Profile image URL |
| `wishlist` | [ObjectId] | no | — | Refs to Product (or variant); can move to `wishlists` collection for scale |
| `addresses` | [Address] | no | — | Embedded; see shape below |
| `isEmailVerified` | Boolean | no | — | Default false |
| `isBlocked` | Boolean | no | — | Default false; blocked users cannot log in |
| `isDeleted` | Boolean | no | yes | Soft delete; default false |
| `deletedAt` | Date | no | — | Set when soft-deleted |
| `lastLoginAt` | Date | no | — | Security/analytics |
| `passwordChangedAt` | Date | no | — | For token invalidation if needed |
| `createdAt` | Date | auto | — | Set by timestamps |
| `updatedAt` | Date | auto | — | Set by timestamps |

### Embedded address shape

Same shape as order address snapshot (so it can be copied to order without transformation):

| Field | Type | Use |
|-------|------|-----|
| `fullName` | String | Display name for delivery |
| `phone` | String | Contact for delivery |
| `street` | String | Address line 1 |
| `city` | String | |
| `state` | String | |
| `postalCode` | String | |
| `country` | String | Default e.g. "India" |
| `isDefault` | Boolean | One per user should be true for default checkout address |

---

## seller_profiles

One document per seller (user with `role: 'seller'`). Linked by `userId`.

### Schema

| Field | Type | Required | Index | Use |
|-------|------|----------|-------|-----|
| `userId` | ObjectId | yes | unique | ref User |
| `shopName` | String | yes | — | Display name of shop |
| `slug` | String | yes | unique | URL-safe store identifier (e.g. /store/my-shop) |
| `description` | String | no | — | Shop description |
| `logo` | String | no | — | Shop logo URL |
| `gstin` | String | no | — | GST identification |
| `pan` | String | no | — | PAN |
| `businessAddress` | Object | no | — | Embedded { street, city, state, postalCode, country } |
| `bankAccountDetails` | String / Object | no | — | Encrypted or ref to vault; store only last4 or display name in DB |
| `isVerified` | Boolean | no | — | Admin verification; default false |
| `isActive` | Boolean | no | yes | Default true; false hides shop |
| `commissionRate` | Number | no | — | Platform commission % if applicable |
| `autoAcceptOrder` | Boolean | no | — | Default false |
| `defaultDeliveryProvider` | String / ObjectId | no | — | Code or ref to delivery_providers for fallback |
| `isDeleted` | Boolean | no | — | Soft delete; default false |
| `deletedAt` | Date | no | — | Set when soft-deleted |
| `createdAt` | Date | auto | — | |
| `updatedAt` | Date | auto | — | |

### Usage

- Resolve seller store by `slug` for public storefront.
- Filter products by `userId` (seller).
- Admin lists sellers by `isActive`, `isVerified`.

---

## Indexes

See [indexes.md](../indexes.md) for full list. Key indexes:

- **users:** `email` (unique), `phone` (unique sparse), `role`, `isDeleted`.
- **seller_profiles:** `userId` (unique), `slug` (unique), `isActive`.

---

## References

- Orders reference `users` by `userId` (buyer); order items snapshot `sellerId` (ref User).
- Products reference `users` by `seller`.
- Carts reference `users` by `userId`.

When a user is soft-deleted, orders and carts are **not** deleted; orders keep snapshot data. Server must enforce that soft-deleted users cannot log in.
