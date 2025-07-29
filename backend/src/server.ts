import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { getLocationById, getAllLocations } from "./data";
import { buildGraphFromJSON, buildGraphWithObstacles } from "./graph";
import { findPath, findKShortestPaths, printAllPaths } from "./astar";
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
const PORT = process.env.PORT || 5002;

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
  const { start, end, restriction } = req.body;

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

  // Use the obstacle-aware graph for the given restriction (default: 'disabled')
  const restrictionType = restriction || "disabled";
  const { adjacencyList, allNodes } = buildGraphWithObstacles(restrictionType);

  // Debug: Print all possible paths between two nodes for a test case
  printAllPaths(adjacencyList, "7", "9");

  // Find up to 3 alternative routes (including the shortest)
  const k = 3;
  const routes = findKShortestPaths(adjacencyList, allNodes, start, end, k);

  if (!routes || routes.length === 0) {
    return res.status(404).json({
      error: `No path found between the selected locations for restriction '${restrictionType}'.`,
    });
  }

  // Debug: Log the number of routes and their node paths
  console.log(
    `Found ${routes.length} route(s) for ${start} -> ${end} (restriction: ${restrictionType})`
  );
  routes.forEach((r, idx) =>
    console.log(`Route ${idx + 1}: ${r.path ? r.path.join(" -> ") : "no path"}`)
  );

  // Format all routes for the frontend
  const formattedRoutes = routes.map((result, idx) => {
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
    return {
      waypoints,
      distance: distanceInMeters,
      directions,
      isShortest: idx === 0,
    };
  });

  return res.json({
    routes: formattedRoutes,
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
