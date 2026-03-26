# Backend Baseline Audit

This file freezes the backend scope before implementing the delivery plan.

## Implemented Foundation

- Gateway entrypoint, proxying, cache, and rate limiting:
  - `api-gateway/src/index.js`
  - `api-gateway/src/proxy/serverProxy.js`
- Core auth and user/customer APIs:
  - `server/src/routes/auth/authRoutes.js`
  - `server/src/controllers/auth/auth.controller.js`
  - `server/src/routes/customer/index.js`
  - `server/src/controllers/products/cartController.js`
  - `server/src/controllers/products/orderController.js`
- Public catalog read APIs:
  - `server/src/routes/public/index.js`
  - `server/src/controllers/products/productController.js`
  - `server/src/controllers/categoryController.js`
- Data model groundwork for sellers, taxes, delivery, reports:
  - `server/src/models/SellerProfile.js`
  - `server/src/models/TaxRule.js`
  - `server/src/models/Category.js`
  - `server/src/models/Product.js`
  - `server/src/models/Order.js`
  - `server/src/models/DeliveryProvider.js`
  - `server/src/models/IdempotencyKey.js`

## Pre-Implementation Gaps

- Seller onboarding flow not exposed via APIs.
- Admin seller approval/activation endpoints missing.
- Weekly/monthly seller reporting APIs missing.
- Tax regime enforcement at listing/reporting layer missing.
- Seller product write APIs and category-field validation missing.
- Courier workflow APIs and webhook/idempotency handling missing.
- Inventory decrement and full order lifecycle management incomplete.
