# Board Studio Client

A React frontend for the Board Studio application, now powered by Firebase.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure Firebase (optional):
   - Copy `.env.example` to `.env`
   - Fill in your Firebase configuration values
   - If Firebase is not configured, the app will use mock data

3. Run the development server:
   ```bash
   npm run dev
   ```

## Firebase Setup (Optional)

If you want to use Firebase instead of mock data:

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Firestore Database
3. Enable Firebase Authentication
4. Copy your config values to `.env`

## Features

- Product catalog with filtering
- Shopping cart
- User authentication
- Order management
- Project creation and cutting lists
- 3D model viewer
- Admin dashboard

## Deployment

Deploy to Firebase Hosting for free:

```bash
npm run build
firebase deploy --only hosting
```

## Architecture

The app uses Firebase services:
- **Firestore**: Database for products, orders, projects, etc.
- **Firebase Auth**: User authentication
- **Mock fallback**: Works without Firebase using local data