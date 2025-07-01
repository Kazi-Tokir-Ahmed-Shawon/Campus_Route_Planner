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

// Simple distance calculation
const calculateDistance = (
  loc1: { lat: number; lng: number },
  loc2: { lat: number; lng: number }
): number => {
  const dx = loc1.lng - loc2.lng;
  const dy = loc1.lat - loc2.lat;
  return Math.sqrt(dx * dx + dy * dy);
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
