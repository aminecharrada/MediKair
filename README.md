# MediKair E-Commerce Platform

A full-featured e-commerce platform for furniture sales with client storefront, admin panel, and backend API.

## Project Structure

```
├── marque-blanche-ecommerce-main/      # Client Frontend (React)
├── marque-blanche-ecommerce-admin-main/ # Admin Panel (React + Chakra UI)
├── marque-blanche-ecommerce-backend-main/ # Backend API (Node.js + Express)
└── .github/workflows/                   # CI/CD Pipelines
```

## Tech Stack

- **Frontend**: React, Styled Components
- **Admin Panel**: React, Chakra UI
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: Firebase Auth
- **Media Storage**: Cloudinary
- **Payment**: Cash on Delivery (Stripe optional)

## Local Development

### Prerequisites
- Node.js 16+ (Node 18 recommended)
- npm or yarn
- MongoDB Atlas account
- Firebase project
- Cloudinary account

### Setup

1. Clone the repository
2. Copy `.env.example` to `.env` in each project folder
3. Fill in your environment variables
4. Install dependencies and run:

```bash
# Backend
cd marque-blanche-ecommerce-backend-main
npm install
npm start

# Frontend (new terminal)
cd marque-blanche-ecommerce-main
npm install
npm start

# Admin (new terminal)
cd marque-blanche-ecommerce-admin-main
npm install
npm start
```

## Deployment

See [DEPLOYMENT_SECRETS.md](./DEPLOYMENT_SECRETS.md) for detailed deployment instructions.

## License

Private - All rights reserved.
