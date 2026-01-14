---
name: Parking App MVP
overview: Create a web-based parking management application for religious institutions with real-time availability tracking, zone-based parking display, and an admin panel for manual spot management.
todos: []
---

# Parking Application MVP Plan

## Architecture Overview

A full-stack web application with real-time updates:

- **Frontend**: React + TypeScript (responsive design for mobile and desktop)

- **Backend**: Node.js + Express + TypeScript

- **Database**: PostgreSQL

- **Real-time**: Socket.io for live updates

- **Authentication**: JWT-based admin authentication

## Project Structure

```javascript
JamaParking/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts
│   │   ├── models/
│   │   │   ├── Location.ts
│   │   │   ├── Zone.ts
│   │   │   └── Admin.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── locations.ts
│   │   │   └── zones.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   ├── socket/
│   │   │   └── parkingSocket.ts
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── public/
│   │   │   │   ├── ParkingDisplay.tsx
│   │   │   │   ├── ZoneCard.tsx
│   │   │   │   ├── LocationSelector.tsx
│   │   │   │   └── NavigationButton.tsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.tsx
│   │   │       ├── ZoneManager.tsx
│   │   │       └── SpotCounter.tsx
│   │   ├── pages/
│   │   │   ├── PublicView.tsx
│   │   │   ├── AdminLogin.tsx
│   │   │   └── AdminDashboard.tsx
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── socket.ts
│   │   │   └── navigation.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Database Schema

### Tables

1. **locations**

- `id` (UUID, primary key)

- `name` (string) - e.g., "Main Mosque Parking"

- `address` (string, optional)

- `latitude` (decimal, optional) - For v2: location-based recommendations

- `longitude` (decimal, optional) - For v2: location-based recommendations

- `created_at` (timestamp)

- `updated_at` (timestamp)

2. **zones**

- `id` (UUID, primary key)

- `location_id` (UUID, foreign key → locations.id)

- `name` (string) - e.g., "Zone A", "Zone B", "East Lot"

- `total_spots` (integer)

- `occupied_spots` (integer, default 0)

- `created_at` (timestamp)

- `updated_at` (timestamp)

3. **admins**

- `id` (UUID, primary key)

- `username` (string, unique)

- `password_hash` (string) - bcrypt hashed

- `location_id` (UUID, foreign key → locations.id)

- `created_at` (timestamp)

## Core Features Implementation

### 1. User-Facing Public View

**File**: `frontend/src/pages/PublicView.tsx`

**Components**:

- **LocationSelector.tsx** - Dropdown/selector to choose mosque/location
  - Lists all available locations (initially one, supports multiple later)
  - Shows location name
  - Displays selected location address
- **NavigationButton.tsx** - Button to open navigation app
  - Detects device type (iOS/Android/Desktop)
  - Opens Apple Maps on iOS
  - Opens Google Maps on Android
  - Opens Google Maps in browser on desktop
  - Uses location address or coordinates
- **ParkingDisplay.tsx** - Main parking information display
  - Shows total available parking spots across all zones for selected location
  - Displays breakdown by zone with:
    - Zone name
    - Available spots (total - occupied)
    - Total spots in zone
    - Visual indicator (color-coded: green/yellow/red based on availability)
- **ZoneCard.tsx** - Individual zone display card

**Features**:

- Location selection dropdown at top of page
- Selected location address displayed prominently
- "Get Directions" / "Navigate" button that opens phone's map app
- Real-time updates via Socket.io when location changes
- Responsive design for mobile devices
- Loading states while fetching location data

### 2. Admin Authentication

**Files**:

- `backend/src/routes/auth.ts` - Login endpoint

- `frontend/src/pages/AdminLogin.tsx` - Login form

- Simple username/password authentication

- JWT token issued on successful login

- Protected routes require valid JWT

### 3. Admin Dashboard

**File**: `frontend/src/pages/AdminDashboard.tsx`

**Features**:

- Zone management: Add/edit/delete zones

- Zone name

- Total spots per zone

- Manual spot counter: Update occupied spots per zone

- Input field to set occupied spots

- Quick increment/decrement buttons

- Real-time preview of public view

- Current status overview (total available, total occupied)

### 4. Backend API Endpoints

**File**: `backend/src/routes/zones.ts`

- `GET /api/zones/:locationId` - Get all zones for a location

- `PUT /api/zones/:zoneId/spots` - Update occupied spots (admin only)

- `POST /api/zones` - Create new zone (admin only)

- `PUT /api/zones/:zoneId` - Update zone (name, total spots) (admin only)

- `DELETE /api/zones/:zoneId` - Delete zone (admin only)

**File**: `backend/src/routes/locations.ts`

- `GET /api/locations` - Get all available locations (for selector)
- `GET /api/locations/:locationId` - Get location details (including address and coordinates)
- `GET /api/locations/:locationId/stats` - Get aggregated parking stats

### 5. Real-time Updates

**File**: `backend/src/socket/parkingSocket.ts`

- Socket.io server setup

- Broadcast zone updates to all connected clients when admin changes spot counts
- Event: `parking-update` with zone data

- Client connects and receives live updates without refresh

**File**: `frontend/src/services/socket.ts`

- Socket.io client connection

- Listen for `parking-update` events

- Update React state with new zone data

**File**: `frontend/src/services/navigation.ts`

- Utility functions to open navigation apps

- `openNavigation(address: string, latitude?: number, longitude?: number)` - Detects device and opens appropriate map app
  - iOS: Opens Apple Maps using `maps://` URL scheme or `http://maps.apple.com/`
  - Android: Opens Google Maps using `google.navigation:` or `https://maps.google.com/`
  - Desktop/Fallback: Opens Google Maps in browser
- Handles URL encoding for addresses
- Uses coordinates if available for more accurate navigation

## Technology Stack Details

- **Frontend Framework**: React 18 with TypeScript

- **Build Tool**: Vite

- **Styling**: Tailwind CSS + Framer Motion (for modern, responsive design with smooth animations)

- **UI Icons**: Lucide React or Heroicons (modern icon library)

- **HTTP Client**: Axios

- **WebSocket**: Socket.io-client

- **Backend Framework**: Express.js with TypeScript

- **ORM**: Prisma or TypeORM (for database operations)

- **Authentication**: jsonwebtoken + bcrypt

- **Database**: PostgreSQL

- **Real-time**: Socket.io

## UI/UX Design Principles

### Modern Design Approach

**Visual Style**:

- Clean, minimalist interface with ample white space
- Modern color palette with gradients and depth
- Glass-morphism effects for cards (frosted glass look)
- Smooth micro-animations and transitions
- Modern typography (Inter, Poppins, or system fonts)
- Subtle shadows and elevation for depth
- Rounded corners for friendly, approachable feel

**Color Scheme**:

- Primary: Islamic green or calming blue tones
- Status colors: 
  - Green (high availability, 70%+)
  - Yellow/Amber (medium availability, 30-70%)
  - Red (low availability, <30%)
- Dark mode support (optional but modern)
- High contrast for accessibility

**Component Design**:

- **Parking Cards**: Elevated cards with hover effects, gradient backgrounds
- **Zone Cards**: Modern cards with progress indicators, animated availability bars
- **Buttons**: Rounded, with gradient or solid colors, smooth hover states
- **Navigation Button**: Prominent, eye-catching design with map icon
- **Location Selector**: Modern dropdown with search capability
- **Admin Panel**: Clean dashboard layout with modern form inputs

**Animations & Interactions**:

- Smooth fade-in transitions when data loads
- Pulse animations for real-time updates
- Hover effects on interactive elements
- Loading skeletons (not spinners) for better UX
- Stagger animations for lists (zones appearing one by one)
- Smooth number counting animations when spot counts change
- Subtle background animations (optional)

**Mobile-First Design**:

- Touch-friendly button sizes (minimum 44x44px)
- Large, readable text
- Swipeable zone cards on mobile
- Bottom sheet modals on mobile (instead of center modals)
- Optimized for one-handed use

**Responsive Breakpoints**:

- Mobile: 320px - 768px
- Tablet: 768px - 1024px
- Desktop: 1024px+

**Modern UI Patterns**:

- Card-based layouts
- Floating action buttons for quick actions (admin)
- Smooth page transitions
- Real-time status indicators with pulse effects
- Progress indicators for parking availability percentages
- Modern form inputs with floating labels
- Toast notifications for admin actions (instead of alerts)

## Implementation Steps

1. **Backend Setup**

- Initialize Node.js project with TypeScript
- Set up Express server
- Configure PostgreSQL database

- Create database schema and migrations

- Implement authentication middleware

2. **Database & Models**

- Create Location, Zone, and Admin models

- Set up database relationships

- Create seed data for initial location

3. **API Routes**

- Implement authentication routes (login)

- Implement zone management routes

- Implement location routes

- Add validation and error handling

4. **WebSocket Setup**

- Configure Socket.io server

- Implement parking update broadcasting

- Handle client connections/disconnections

5. **Frontend Setup**

- Initialize React project with Vite

- Set up routing (React Router)

- Configure API service and Socket.io client

- Implement responsive layout

6. **Public View**

- Create location selector component

- Create navigation button component

- Create parking display component

- Create zone card components

- Integrate location selection with parking data

- Implement navigation functionality

- Implement real-time updates

- Add loading and error states

7. **Admin Panel**

- Create admin login page

- Implement JWT token storage

- Create admin dashboard layout

- Build zone management interface

- Build spot counter interface

8. **Modern UI/UX Implementation**

- Set up Tailwind CSS with custom color palette

- Configure Framer Motion for animations

- Create reusable modern components (cards, buttons, inputs)

- Implement glass-morphism effects for cards

- Add smooth animations (fade-ins, stagger effects, hover states)

- Create loading skeletons for better perceived performance

- Implement number counting animations for spot changes

- Add pulse animations for real-time update indicators

- Design mobile-first responsive layout

- Create modern color-coded availability indicators (green/yellow/red)

- Implement modern typography and spacing

- Add smooth transitions and micro-interactions

- Create elegant error states and empty states

- Design modern admin dashboard with clean layout

- Add toast notifications for admin actions

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string

- `JWT_SECRET` - Secret for JWT token signing

- `PORT` - Backend server port

- `NODE_ENV` - Environment (development/production)

## Future Considerations (v2)

### 1. Camera Integration for Automatic Spot Counting

- Camera access integration (mobile/webcam)
- Computer vision/AI SDK integration for automatic spot detection
- Image processing to count available parking spots
- Admin can take photos to auto-update spot counts

### 2. Image Upload for Zone Visualization

- Upload zone maps/images
- Visual representation of parking zones on public view
- Interactive zone selection

### 3. Multi-Location Support with Smart Recommendations

**Feature Overview**: When the app supports multiple locations, provide intelligent location recommendations based on user's current position and parking availability probability.

**Database Changes**:

- Add `latitude` and `longitude` fields to `locations` table (already added above)
- Store geographic coordinates for each location

**Frontend Components**:

- `LocationSelector.tsx` - Component to select or view recommended locations
- `LocationRecommendation.tsx` - Displays recommended location with reasoning
- `GeolocationService.ts` - Handles browser geolocation API
- `RecommendationCard.tsx` - Shows distance, parking probability, and recommendation score

**Backend API Endpoints** (to be added in v2):

- `GET /api/locations` - Get all locations with current parking stats
- `POST /api/locations/recommend` - Get recommended location based on user coordinates
  - Request body: `{ latitude: number, longitude: number, prayerType: 'jumuah' | 'taraweeh' }`
  - Response: Array of locations sorted by recommendation score

**Recommendation Algorithm Logic**:

The system should recommend locations using a scoring algorithm that considers:

1. **Distance Factor** (40% weight):

   - Calculate straight-line distance from user to each location
   - Normalize distance (closer = higher score)

2. **Parking Availability Probability** (60% weight):

   - Current availability percentage = (available_spots / total_spots) * 100
   - Consider historical patterns for prayer times (e.g., Friday 1-2 PM typically has high demand)
   - Factor in time remaining until prayer time
   - Higher availability = higher score

3. **Combined Score**:

   - `score = (distance_score * 0.4) + (availability_score * 0.6)`
   - Rank locations by combined score
   - Present top 3 recommendations with reasoning

**Prayer Type Considerations**:

- **Jumuah/Friday Prayer**: Typically 12-2 PM, high demand expected
- **Ramadan Taraweeh**: Evening prayers, demand peaks 30-60 minutes before Maghrib

**Implementation Notes for v2**:

- Use browser Geolocation API (requires user permission)
- Calculate distance using Haversine formula
- Consider time-of-day patterns for different prayer types
- Store historical parking data for predictive scoring
- Display recommendation reason (e.g., "Closest location with 80% availability")
- Allow manual location selection if geolocation is disabled/denied

**Files to Create in v2**:

- `backend/src/services/recommendationService.ts` - Recommendation algorithm
- `backend/src/utils/distance.ts` - Distance calculation utilities
- `frontend/src/hooks/useGeolocation.ts` - React hook for geolocation
- `frontend/src/services/recommendationService.ts` - Frontend recommendation logic
- `frontend/src/pages/LocationSelect.tsx` - Location selection page

