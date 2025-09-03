# Golden Chopsticks Restaurant - Frontend Client

This is the standalone frontend client for the Golden Chopsticks Restaurant application.

## Prerequisites

Make sure the backend API is running from the `../Restaurants_API` directory.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

The client will run on http://localhost:3000 and connect to the API at http://localhost:5000/api.

## Backend API

This client expects the backend API to be running at `http://localhost:5000/api`. 

To start the backend:
```bash
cd ../Restaurants_API
npm run dev
```

## Environment Variables

Copy the `.env` file and update the values as needed:

- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:5000/api)
- `REACT_APP_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key for payments
- `REACT_APP_GOOGLE_API_KEY`: Google API key for maps and places
- `REACT_APP_GOOGLE_CLIENT_ID`: Google OAuth client ID