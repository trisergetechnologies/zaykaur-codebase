# Zaykaur Admin-Seller Dashboard

Role-based dashboard for admin and seller (products, orders, reports, etc.). Uses Zaykaur backend APIs via the API Gateway.

## Running locally

1. **Backend server** – e.g. `cd server && npm run dev` (default port 5000).
2. **API Gateway** – `cd api-gateway && npm run dev` (port 4000). Set `SERVER_URL=http://localhost:5000` in `api-gateway/.env`.
3. **Dashboard** – `npm run dev` (runs on port **3001** so it does not conflict with the gateway). Set `NEXT_PUBLIC_API_URL=http://localhost:4000` in `.env`.

If the gateway is not running on 4000, or the dashboard runs on 4000, product image upload will return 404. Use the ports above and ensure the gateway is started before using Add Product.