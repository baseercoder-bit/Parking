# JamaParking - Mosque Parking Management App

A modern, real-time parking management application designed for mosques and religious institutions, especially for Friday Prayers (Jumuah) and Ramadan Taraweeh prayers.

## Features

- **Real-time Parking Availability**: View live parking spot availability with instant updates
- **Zone-based Management**: Organize parking lots into zones with individual spot tracking
- **Admin Dashboard**: Easy-to-use admin panel for managing zones and updating spot counts
- **Location Navigation**: One-click navigation to mosques using device's map app
- **Modern UI**: Beautiful, responsive design with smooth animations
- **Mobile-first**: Optimized for mobile devices with touch-friendly interface

## Tech Stack

### Backend
- Node.js + Express + TypeScript
- PostgreSQL with Prisma ORM
- Socket.io for real-time updates
- JWT authentication

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS + Framer Motion
- React Router
- Socket.io-client
- Axios

## Getting Started

### Prerequisites

- Node.js (v22.0.0 or higher recommended - see `.nvmrc` file)
- PostgreSQL database
- npm (v10.0.0 or higher) or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/jamaparking?schema=public"
JWT_SECRET="your-secret-key-change-this-in-production"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

4. Generate Prisma client:
```bash
npm run prisma:generate
```

5. Run database migrations:
```bash
npm run prisma:migrate
```

6. Seed the database (optional - creates initial location, zones, and admin user):
```bash
npm run prisma:seed
```

   Default admin credentials:
   - Username: `admin`
   - Password: `admin123`

7. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory (optional):
```env
VITE_API_URL=http://localhost:3001
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Project Structure

```
JamaParking/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── middleware/      # Auth middleware
│   │   ├── models/          # Prisma models (in schema.prisma)
│   │   ├── routes/          # API routes
│   │   ├── socket/          # Socket.io setup
│   │   └── server.ts        # Express server
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Seed script
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── public/      # Public view components
│   │   │   └── admin/       # Admin components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API and socket services
│   │   └── App.tsx          # Main app component
│   └── package.json
└── README.md
```

## API Endpoints

### Public Endpoints
- `GET /api/locations` - Get all locations
- `GET /api/locations/:locationId` - Get location details with zones
- `GET /api/locations/:locationId/stats` - Get parking statistics
- `GET /api/zones/:locationId` - Get zones for a location

### Admin Endpoints (Require Authentication)
- `POST /api/auth/login` - Admin login
- `POST /api/zones` - Create new zone
- `PUT /api/zones/:zoneId` - Update zone
- `PUT /api/zones/:zoneId/spots` - Update occupied spots
- `DELETE /api/zones/:zoneId` - Delete zone

## Usage

### Admin Login
1. Navigate to `/admin/login`
2. Use the default credentials or create your own admin user
3. Access the dashboard to manage zones and update spot counts

### Public View
1. Visit the homepage `/`
2. Select a location from the dropdown
3. View real-time parking availability by zone
4. Click "Get Directions" to navigate to the mosque

## Future Features (v2)

- **Camera Integration**: Automatic spot counting using computer vision/AI
- **Zone Visualization**: Upload and display zone maps
- **Smart Recommendations**: Location-based recommendations for users based on proximity and availability
- **Multiple Locations**: Support for multiple mosque locations with smart routing

## License

ISC

