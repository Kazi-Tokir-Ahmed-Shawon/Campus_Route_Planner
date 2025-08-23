# Campus Map Backend

A Node.js/Express backend with MongoDB for the campus map application, providing CRUD operations for campus locations and obstacles.

## Features

- **MongoDB Integration**: Full CRUD operations for locations and obstacles
- **Two Location Types**:
  - `all-campus`: All USW campus locations
  - `tree-house-campus`: Treeforest campus specific locations
- **Obstacle Management**: Track accessibility restrictions for different user types
- **Data Seeding**: Import existing JSON data into MongoDB
- **TypeScript**: Full type safety and modern development experience

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=your_actual_mongodb_uri_here

# Server Configuration
PORT=5001
NODE_ENV=development
```

### 3. Database Setup

The application uses:

- **Database**: `campus-db`
- **Collection**: `campus-collection`

### 4. Data Seeding

After setting up your MongoDB URI, seed the database with existing data:

```bash
npm run seed
```

This will import:

- All campus locations from `USW_All_Campuses.json`
- Treeforest campus locations from `USW_Treeforest_campus_map.json`
- Obstacles from `obstacles.json`

## API Endpoints

### Locations

- `GET /api/locations` - Get all locations (optional `?type=all-campus` or `?type=tree-house-campus`)
- `GET /api/locations/:id` - Get location by ID
- `POST /api/locations` - Create new location
- `PUT /api/locations/:id` - Update location
- `DELETE /api/locations/:id` - Delete location

### Obstacles

- `GET /api/obstacles` - Get all obstacles
- `GET /api/obstacles/:id` - Get obstacle by ID
- `POST /api/obstacles` - Create new obstacle
- `PUT /api/obstacles/:id` - Update obstacle
- `DELETE /api/obstacles/:id` - Delete obstacle

## Data Models

### Location Schema

```typescript
{
  id: string;           // Unique identifier
  name: string;         // Location name
  label: string;        // Short label
  lat: number;          // Latitude
  lng: number;          // Longitude
  type: 'all-campus' | 'tree-house-campus';
  room_code?: string;   // Optional room code
  welsh_name?: string;  // Optional Welsh name
  createdAt: Date;
  updatedAt: Date;
}
```

### Obstacle Schema

```typescript
{
  id: string;                    // Unique identifier
  name: string;                  // Obstacle name
  lat: number;                   // Latitude
  lng: number;                   // Longitude
  restricted_for: string[];      // Array of restrictions: ['walk', 'cycle', 'disabled']
  createdAt: Date;
  updatedAt: Date;
}
```

## Development

### Start Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

## Data Migration

The system maintains backward compatibility by:

1. Using JSON files as fallback during transition
2. Providing MongoDB endpoints for new functionality
3. Supporting gradual migration from JSON to database

## Notes

- All coordinates are stored as numbers (latitude/longitude)
- Location IDs must be unique across the entire collection
- Obstacle restrictions are validated against allowed values
- The seeding script will only run if the database is empty
