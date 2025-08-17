# Campus Map Application

A full-stack campus navigation and information system built with Next.js frontend and Node.js backend.

##  Project Structure

```
campus-map/
├── frontend/          # Next.js frontend application
│   ├── src/
│   │   └── app/      # Next.js App Router
│   ├── public/       # Static assets
│   └── package.json
├── backend/          # Node.js backend API
│   ├── src/
│   │   └── server.ts # Main server file
│   └── package.json
└── README.md
```


### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create environment file:

   ```bash
   cp env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The backend will be running on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be running on `http://localhost:3000`

##  Available Scripts

### Backend Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the TypeScript code
- `npm run start` - Start production server
- `npm run clean` - Clean build directory

### Frontend Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## API Endpoints

### Health Check

- `GET /api/health` - Check backend server status

### Sample Endpoint

- `GET /api/hello` - Sample API response

## Features

- **Interactive Map Interface** - Navigate through campus buildings and facilities
- **Real-time Updates** - Get live campus information and announcements
- **Campus Directory** - Find faculty, staff, and department information
- **Backend Health Monitoring** - Real-time backend status checking
- **Responsive Design** - Works on desktop and mobile devices

## Security Features

- CORS configuration for secure cross-origin requests
- Helmet.js for security headers
- Environment variable management
- Input validation and sanitization

## Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **ESLint** - Code linting

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe JavaScript
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger
- **Dotenv** - Environment variable management

## Development Workflow

1. Start both servers in separate terminals
2. Make changes to frontend or backend code
3. Changes will automatically reload (hot reload enabled)
4. Test API endpoints using the health check feature

##  Environment Variables

### Backend (.env)

```env
PORT=5002
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```


