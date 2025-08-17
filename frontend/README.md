# Campus Map Frontend

A Next.js application for interactive campus navigation and routing.

## Features

### 🏠 Home Page (`/`)

- Interactive route planning between campus locations
- Real-time route calculation with multiple travel modes
- Detailed route information and directions
- Backend health monitoring

### ⚙️ Admin Panel (`/admin`)

- Add new campus locations with coordinates
- Add new obstacles with access restrictions
- View existing campus locations and obstacles
- Tabbed interface for easy management

### 🗺️ All Campus Map (`/all-campus-map`)

- Interactive Google Maps showing all USW campuses
- Real-time route planning between campuses
- Multiple travel modes (driving, walking, cycling, transit)
- Campus information on marker click

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. For the All Campus Map page, you'll need a Google Maps API key:

   - Get one from [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Maps JavaScript API and Directions API
   - Enter the API key when prompted on the page

3. Run the development server:
   ```bash
   npm run dev
   ```

## Navigation

The application includes a top navigation bar with:

- **Home**: Route planning interface
- **Admin Panel**: Management interface for locations and obstacles
- **All Campus Map**: Interactive map with all campuses

## Data Sources

- Campus locations: `public/USW_All_Campuses.json`
- Obstacles: `public/obstacles.json`
- Campus map data: `public/USW_Treeforest_campus_map.json`

## Technologies Used

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- Google Maps JavaScript API
- Leaflet (for main campus map)
- React hooks for state management
