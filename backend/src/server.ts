import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { getLocationById, getAllLocations } from "./data";
import { buildGraphFromJSON } from "./graph";
import { findPath } from "./astar";
import axios from "axios";

interface OSRMRoute {
  geometry: any;
  distance: number;
}

interface OSRMResponse {
  code: string;
  routes: OSRMRoute[];
}

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend server is running",
    timestamp: new Date().toISOString(),
  });
});

// Sample API endpoint
app.get("/api/hello", (req, res) => {
  res.json({
    message: "Hello from the backend!",
    timestamp: new Date().toISOString(),
  });
});

// Route finding endpoint
app.post("/api/route", async (req, res) => {
  const { start, end } = req.body;

  if (!start || !end) {
    return res
      .status(400)
      .json({ error: "Start and end points are required." });
  }

  const startLocation = getLocationById(start);
  const endLocation = getLocationById(end);

  if (!startLocation || !endLocation) {
    return res.status(404).json({ error: "One or both locations not found." });
  }

  // Build the graph from our JSON file and find the path using A*
  const { adjacencyList, allNodes } = buildGraphFromJSON();
  const result = findPath(adjacencyList, allNodes, start, end);

  if (!result) {
    return res
      .status(404)
      .json({ error: "No path found between the selected locations." });
  }

  // We have the waypoints from our A* algorithm.
  // Convert the path of IDs to an array of coordinates for the LineString.
  const waypoints = result.path.map((id) => {
    const location = allNodes[id];
    return [location.lng, location.lat];
  });

  const distanceInMeters = result.distance * 111139; // Approximate conversion

  const directions = result.path.map((id, index) => {
    const name = getLocationById(id)?.name || `Intersection ${id}`;
    if (index === 0) return `Start at ${name}`;
    return `Proceed to ${name}`;
  });
  directions.push(`You have arrived.`);

  return res.json({
    waypoints: waypoints,
    distance: distanceInMeters,
    directions,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      error: "Something went wrong!",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
});
