# Domas Ventures — E-Commerce Footwear Store

**Step in Style, Walk with Confidence**

A React e-commerce web application for Domas Ventures, featuring a customer storefront and admin dashboard.

## Features

### Customer Storefront
- Browse footwear by category with search and filters
- View product prices, sizes, and descriptions
- Add items to cart and adjust quantities
- Checkout with contact details, Kenya county dropdown (all 47 counties), name, and gender
- Order confirmation message after placement

### Admin Dashboard (`/admin`)
- Secure login portal
- Dashboard with sales overview
- **Products**: Add, edit, and delete products (changes reflect on the storefront)
- **Orders**: View all customer orders with full details, update status, or delete

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Admin Access

- URL: [http://localhost:5173/admin/login](http://localhost:5173/admin/login)
- Default password: `domas2024`

## Running the API server (optional)

This project now includes a minimal Express API for production-ready admin auth and persistence. For local development run the frontend and the API server in separate terminals:

```bash
npm install
# start the API server on port 4000
npm run server
# in a separate terminal start the dev frontend
npm run dev
```

Notes:
- The admin password is seeded from `ADMIN_PASSWORD` environment variable or defaults to `domas2024` if not provided. Change it in production.
- The server persists data to `server/db.json` using a lightweight JSON store.

## Production notes and environment

- Create a `.env` from `.env.example` and set strong values for `ADMIN_PASSWORD` and `SESSION_SECRET`.
- When deploying behind a proxy or load balancer, ensure `TRUST_PROXY=1` so secure cookies work correctly.
- Always run the server with `NODE_ENV=production` and serve over HTTPS in production to ensure cookies marked `secure` are sent by browsers.

Example `.env` (do not commit):

```
ADMIN_PASSWORD=your-strong-admin-password
SESSION_SECRET=long-random-secret
TRUST_PROXY=1
NODE_ENV=production
PORT=4000
```

## Deployment

This app is ready to deploy as a single hosted service.

For production, build the frontend and start the Express server from the same host:

```bash
npm install
npm run build
npm start
```

If your platform runs install and start separately, the build step should happen before `npm start`.

Recommended hosts:
- Render / Railway / Fly.io: use `npm start` as the start command
- Heroku: add a `Procfile` with `web: npm start`
- Vercel: deploy the frontend and set `VITE_API_URL` to your backend host

### Deploying on Vercel

This repository can be hosted on Vercel as a static frontend.

1. Deploy the site and publish the `dist` directory.
2. Set the Vercel environment variable `VITE_API_URL` to your backend URL, for example `https://my-backend.example.com`.
3. Set your backend environment variables for cross-origin auth:
   - `CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app`
   - `COOKIE_SAME_SITE=none`
   - `TRUST_PROXY=1`
   - `NODE_ENV=production`
   - `SESSION_SECRET=long-random-secret`
   - `ADMIN_PASSWORD=your-strong-admin-password`
4. Ensure your backend is deployed separately and accessible over HTTPS.

The Vercel frontend will then call the API at the external backend host.

### Backend deployment options

The backend API can run anywhere Node is supported. The repository includes a `Dockerfile` for a containerized backend service.

- Build and run locally:
  ```bash
  docker build -t domas-backend .
  docker run -p 4000:4000 \
    -e NODE_ENV=production \
    -e SESSION_SECRET=your-secret \
    -e ADMIN_PASSWORD=your-admin-password \
    -e CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app \
    -e COOKIE_SAME_SITE=none \
    -e TRUST_PROXY=1 \
    domas-backend
  ```

- Deploy the backend to Render using the existing `render.yaml` file.
  - The backend service is named `classroom-backend`.
  - Configure the backend URL in the frontend service as `VITE_API_URL`.

- Deploy the frontend to Render as a static site as well, or keep it on Vercel.
  - The static site service is named `classroom-frontend`.

If you need to run the API server and frontend separately in development, set `VITE_API_URL=http://localhost:4000` in `.env` or `.env.local`, and add `http://localhost:5173` to `CORS_ALLOWED_ORIGINS` on the backend.

## Brand Colors

| Color | Hex |
|-------|-----|
| Navy (primary) | `#003366` |
| White | `#ffffff` |
| Black | `#000000` |
| Green (accent) | `#228b22` |

## Tech Stack

- React 19
- React Router 7
- Vite 5
- LocalStorage for product and order persistence

## Build for Production

```bash
npm run build
npm run preview
```
