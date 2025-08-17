import fs from "fs";
import path from "path";
import { getAllLocations } from "./data";

interface GraphNode {
  id: string;
  lat: number;
  lng: number;
}

interface GraphEdge {
  source: string;
  target: string;
}

// Mode-specific speed constants (in meters per second)
const SPEEDS = {
  walk: 1.4, // 5 km/h = 1.4 m/s (average walking speed)
  cycle: 4.2, // 15 km/h = 4.2 m/s (average cycling speed on campus)
  disabled: 1.0, // 3.6 km/h = 1.0 m/s (wheelchair/accessibility speed)
  default: 1.4, // Default to walking speed
};

// Mode-specific distance multipliers for realistic routing
const DISTANCE_MULTIPLIERS = {
  walk: 1.0, // Direct distance for walking
  cycle: 0.9, // Cyclists can take slightly more direct routes
  disabled: 1.2, // Accessibility routes may need to be longer to avoid obstacles
  default: 1.0,
};

// Proper distance calculation using Haversine formula for geographic coordinates
const calculateDistance = (
  loc1: { lat: number; lng: number },
  loc2: { lat: number; lng: number }
): number => {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
  const dLng = ((loc2.lng - loc1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((loc1.lat * Math.PI) / 180) *
      Math.cos((loc2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
};

// Calculate time based on distance and mode
const calculateTime = (distance: number, mode: string): number => {
  const speed = SPEEDS[mode as keyof typeof SPEEDS] || SPEEDS.default;
  return distance / speed; // Time in seconds
};

// Load obstacles from JSON
const loadObstacles = () => {
  const obstaclesPath = path.join(__dirname, "obstacles.json");
  const data = JSON.parse(fs.readFileSync(obstaclesPath, "utf-8"));
  return data.obstacles || [];
};

// Build a graph that penalizes routes through obstacles rather than completely blocking them
export const buildGraphWithObstacles = (restriction: string) => {
  const buildingLocations = getAllLocations();
  const graphPath = path.join(__dirname, "campus_graph.json");
  const graphData: { nodes: GraphNode[]; edges: GraphEdge[] } = JSON.parse(
    fs.readFileSync(graphPath, "utf-8")
  );
  const obstacles = loadObstacles();

  // Find obstacle coordinates for this restriction
  const restrictedObstacles = (obstacles as any[]).filter((obs) =>
    (obs as any).restricted_for.includes(restriction)
  );

  // Helper to check if a node is near an obstacle and get penalty
  const getObstaclePenalty = (lat: number, lng: number, mode: string) => {
    let penalty = 0;
    for (const obs of restrictedObstacles) {
      const distance = Math.sqrt(
        Math.pow(lat - obs.lat, 2) + Math.pow(lng - obs.lng, 2)
      );
      // If very close to obstacle (within 50 meters), apply penalty
      if (distance < 0.0005) {
        // Approximately 50 meters
        // Different penalties for different modes
        switch (mode) {
          case "walk":
            penalty += 500; // Moderate penalty for walking
            break;
          case "cycle":
            penalty += 1000; // Higher penalty for cycling (more affected by obstacles)
            break;
          case "disabled":
            penalty += 2000; // Highest penalty for accessibility (must avoid obstacles)
            break;
          default:
            penalty += 500;
        }
      }
    }
    return penalty;
  };

  // Combine building locations and path nodes (include all nodes)
  const allNodes: { [key: string]: { lat: number; lng: number } } = {};
  for (const [id, loc] of Object.entries(buildingLocations)) {
    allNodes[id] = { lat: loc.lat, lng: loc.lng };
  }
  for (const node of graphData.nodes) {
    allNodes[node.id] = { lat: node.lat, lng: node.lng };
  }

  // Build the adjacency list with penalties for obstacles
  const adjacencyList: { [key: string]: { [key: string]: number } } = {};
  for (const edge of graphData.edges) {
    const sourceNode = allNodes[edge.source];
    const targetNode = allNodes[edge.target];

    if (sourceNode && targetNode) {
      const baseDistance = calculateDistance(sourceNode, targetNode);

      // Apply mode-specific distance multiplier
      const modeMultiplier =
        DISTANCE_MULTIPLIERS[
          restriction as keyof typeof DISTANCE_MULTIPLIERS
        ] || DISTANCE_MULTIPLIERS.default;
      const adjustedDistance = baseDistance * modeMultiplier;

      // Add penalties for obstacles near either node
      const sourcePenalty = getObstaclePenalty(
        sourceNode.lat,
        sourceNode.lng,
        restriction
      );
      const targetPenalty = getObstaclePenalty(
        targetNode.lat,
        targetNode.lng,
        restriction
      );
      const totalPenalty = sourcePenalty + targetPenalty;

      const finalDistance = adjustedDistance + totalPenalty;

      if (!adjacencyList[edge.source]) adjacencyList[edge.source] = {};
      if (!adjacencyList[edge.target]) adjacencyList[edge.target] = {};
      adjacencyList[edge.source][edge.target] = finalDistance;
      adjacencyList[edge.target][edge.source] = finalDistance;
    }
  }

  return { adjacencyList, allNodes };
};

export const buildGraphFromJSON = () => {
  const buildingLocations = getAllLocations();

  // Load the graph structure from the new JSON file
  const graphPath = path.join(__dirname, "campus_graph.json");
  const graphData: { nodes: GraphNode[]; edges: GraphEdge[] } = JSON.parse(
    fs.readFileSync(graphPath, "utf-8")
  );

  // Combine building locations and path nodes
  const allNodes: { [key: string]: { lat: number; lng: number } } = {};
  for (const [id, loc] of Object.entries(buildingLocations)) {
    allNodes[id] = { lat: loc.lat, lng: loc.lng };
  }
  for (const node of graphData.nodes) {
    allNodes[node.id] = { lat: node.lat, lng: node.lng };
  }

  // Build the adjacency list from the edges defined in the JSON
  const adjacencyList: { [key: string]: { [key: string]: number } } = {};

  for (const edge of graphData.edges) {
    const sourceNode = allNodes[edge.source];
    const targetNode = allNodes[edge.target];

    if (sourceNode && targetNode) {
      const distance = calculateDistance(sourceNode, targetNode);

      if (!adjacencyList[edge.source]) adjacencyList[edge.source] = {};
      if (!adjacencyList[edge.target]) adjacencyList[edge.target] = {};

      adjacencyList[edge.source][edge.target] = distance;
      adjacencyList[edge.target][edge.source] = distance; // Undirected graph
    }
  }

  return { adjacencyList, allNodes };
};

// Export the utility functions for use in other modules
export { calculateDistance, calculateTime, SPEEDS, DISTANCE_MULTIPLIERS };
