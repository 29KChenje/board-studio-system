# Board Studio System

Board Studio System is a modular full-stack web application for a furniture and board-cutting business. It includes:

- A Node.js + Express API
- A Firebase Firestore backend
- A React frontend
- A grain-aware cutting optimization engine
- A Three.js-powered 3D cabinet viewer
- Workshop PDF exports
- Shop, cart, and checkout flows

## Project Structure

```text
.
|-- client
|-- server
`-- README.md
```

## Backend Features

- JWT-based authentication for `admin` and `customer`
- Project creation with dimensions and optional auto-generated cabinet pieces
- Piece management with grain direction and edge banding flags
- Best-fit guillotine cutting optimization with support for multiple boards
- Quote generation using board, cutting, and edging costs
- PDF exports for cutting lists and cutting layouts
- Product catalog with admin CRUD and image upload support
- Persistent cart and checkout flow stored in Firebase Firestore
- Simulated payment integration with stored payment records
- Payment provider abstraction prepared for Stripe/Paystack integration
- Email/SMS provider abstraction prepared for SendGrid/Twilio integration
- Customer order history and admin workflow management
- Invoice and receipt PDF exports
- Admin dashboard summary for customers, projects, orders, and stock

## Frontend Features

- Login and registration screens
- Customer dashboard
- Project creation workflow
- Cutting list and optimization summary
- PDF export actions for workshop printouts
- 3D cabinet viewer with orbit/zoom controls
- Shop page with search and category filters
- Cart and checkout pages
- Customer order history page
- Admin panel with high-level stock and revenue metrics
- Admin order management page
- Product edit UI and simple analytics charts

## Setup

### 1. Install dependencies

Run these from the project root:

```bash
npm install
```

### 2. Configure environment variables

Copy these example files and adjust values if needed:

```bash
copy server\\.env.example server\\.env
copy client\\.env.example client\\.env
```

### 3. Configure Firebase

Create a Firebase project, enable Firestore, then create a service account key in:

`Firebase Console -> Project settings -> Service accounts -> Generate new private key`

Paste the values into `server/.env`, or set `FIREBASE_SERVICE_ACCOUNT_PATH` to the downloaded JSON file.

### 4. Seed Firestore

Run:

```bash
npm run seed:firebase --workspace server
```

Seed accounts use password `password123`.

## Running the app

Start the API:

```bash
npm run dev:server
```

Start the frontend in another terminal:

```bash
npm run dev:client
```

Frontend URL: `http://localhost:5173`  
API URL: `http://localhost:5000`

Run backend tests:

```bash
npm run test:server
```

## Simulated Payments

The checkout flow includes a simulated gateway so you can test payment handling without a live provider.

- Card payments succeed when the card number ends with `42` or `4242`
- Cash payments are auto-approved
- Failed payments stop stock deduction and order completion

## Deployment

You can run the full stack with Docker:

```bash
docker compose up --build
```

Legacy MySQL schema and backup scripts are still in `server/database` and `server/scripts` only as references from the earlier version.

## API Endpoints

- `POST /api/register`
- `POST /api/login`
- `POST /api/projects`
- `GET /api/projects/:id`
- `POST /api/pieces`
- `GET /api/pieces/:projectId`
- `POST /api/optimize`
- `GET /api/3d-model/:projectId`
- `GET /api/products`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/cart`
- `POST /api/cart/items`
- `PUT /api/cart/items/:itemId`
- `DELETE /api/cart/items/:itemId`
- `POST /api/orders/workshop`
- `POST /api/orders/checkout`
- `GET /api/orders/mine`
- `PATCH /api/orders/:id/status`
- `GET /api/orders`
- `GET /api/admin/dashboard`
- `GET /api/exports/projects/:projectId/cutting-list.pdf`
- `GET /api/exports/projects/:projectId/cutting-layout.pdf`
- `GET /api/exports/orders/:orderId/invoice.pdf`
- `GET /api/exports/orders/:orderId/receipt.pdf`

## Optimization Notes

The optimizer uses a best-fit guillotine free-rectangle strategy:

- Pieces are expanded by quantity
- Larger areas are placed first
- Fixed-grain pieces are never rotated
- Flexible-grain pieces may rotate if rotation improves fit
- Placements are scored by short-side fit, long-side fit, then leftover waste
- Additional boards are created automatically when a board fills up

## Production Readiness Notes

- Environment variables are externalized
- Architecture is separated into routes, controllers, services, and repositories
- Validation middleware is applied on key write routes
- Firestore seeding support is included, and the older SQL files remain only as legacy references
- Basic logging, simulated notifications, and Docker deployment files are included
- Production env template is included at `server/.env.production.example`
- System health endpoint is available at `GET /api/admin/system-health`
- The codebase is ready for further hardening such as automated tests and live provider integrations
