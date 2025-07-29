// A simplified A* implementation for our non-grid graph
// In a real application, a more robust library like 'tinyqueue' for the priority queue
// would be a good optimization.

interface Node {
  id: string;
  f: number; // g + h
  g: number; // cost from start
  h: number; // heuristic cost to end
  parent: Node | null;
}

interface PathResult {
  path: string[];
  distance: number;
}

const heuristic = (
  loc1: { lat: number; lng: number },
  loc2: { lat: number; lng: number }
): number => {
  // Euclidean distance as the heuristic
  const dx = loc1.lng - loc2.lng;
  const dy = loc1.lat - loc2.lat;
  return Math.sqrt(dx * dx + dy * dy);
};

export const findPath = (
  graph: { [key: string]: { [key: string]: number } },
  locations: { [key: string]: { lat: number; lng: number } },
  startId: string,
  endId: string
): PathResult | null => {
  const openSet: Node[] = [];
  const closedSet = new Set<string>();

  const startNode: Node = { id: startId, f: 0, g: 0, h: 0, parent: null };
  startNode.h = heuristic(locations[startId], locations[endId]);
  startNode.f = startNode.h;
  openSet.push(startNode);

  while (openSet.length > 0) {
    // Find the node with the lowest f score in the open set
    openSet.sort((a, b) => a.f - b.f);
    const currentNode = openSet.shift();

    if (!currentNode) {
      return null; // Should not happen
    }

    if (currentNode.id === endId) {
      // Reconstruct path
      const path = [];
      let temp: Node | null = currentNode;
      while (temp) {
        path.push(temp.id);
        temp = temp.parent;
      }
      return { path: path.reverse(), distance: currentNode.g };
    }

    closedSet.add(currentNode.id);

    const neighbors = graph[currentNode.id] || {};
    for (const neighborId in neighbors) {
      if (closedSet.has(neighborId)) {
        continue;
      }

      const gScore = currentNode.g + neighbors[neighborId];

      let neighborNode = openSet.find((node) => node.id === neighborId);

      if (!neighborNode) {
        neighborNode = {
          id: neighborId,
          g: gScore,
          h: heuristic(locations[neighborId], locations[endId]),
          f: 0,
          parent: currentNode,
        };
        neighborNode.f = neighborNode.g + neighborNode.h;
        openSet.push(neighborNode);
      } else if (gScore < neighborNode.g) {
        // This is a better path. Record it.
        neighborNode.parent = currentNode;
        neighborNode.g = gScore;
        neighborNode.f = neighborNode.g + neighborNode.h;
      }
    }
  }

  // No path found
  return null;
};

// Find up to k alternative shortest paths using a simple Yen's algorithm approach
export const findKShortestPaths = (
  graph: { [key: string]: { [key: string]: number } },
  locations: { [key: string]: { lat: number; lng: number } },
  startId: string,
  endId: string,
  k: number
): PathResult[] => {
  const paths: PathResult[] = [];
  const removedEdges: Array<[string, string, number]> = [];

  // Helper to remove an edge
  const removeEdge = (from: string, to: string) => {
    if (graph[from] && graph[from][to] !== undefined) {
      removedEdges.push([from, to, graph[from][to]]);
      delete graph[from][to];
    }
    if (graph[to] && graph[to][from] !== undefined) {
      removedEdges.push([to, from, graph[to][from]]);
      delete graph[to][from];
    }
  };

  // Helper to restore all removed edges
  const restoreEdges = () => {
    for (const [from, to, weight] of removedEdges) {
      if (!graph[from]) graph[from] = {};
      graph[from][to] = weight;
    }
    removedEdges.length = 0;
  };

  // Find the first shortest path
  const firstPath = findPath(graph, locations, startId, endId);
  if (!firstPath) return [];
  paths.push(firstPath);

  for (let i = 1; i < k; i++) {
    // Remove one edge from the previous shortest path (try each edge in order)
    let found = false;
    for (let j = 0; j < paths[i - 1].path.length - 1; j++) {
      const from = paths[i - 1].path[j];
      const to = paths[i - 1].path[j + 1];
      removeEdge(from, to);
      const altPath = findPath(graph, locations, startId, endId);
      restoreEdges();
      if (
        altPath &&
        !paths.some((p) => p.path.join() === altPath.path.join())
      ) {
        paths.push(altPath);
        found = true;
        break;
      }
    }
    if (!found) break; // No more alternatives
  }
  return paths;
};

// Debug: Print all possible paths between two nodes (for testing)
export const printAllPaths = (
  graph: { [key: string]: { [key: string]: number } },
  startId: string,
  endId: string
) => {
  const allPaths: string[][] = [];
  const visited = new Set<string>();
  const path: string[] = [];

  function dfs(current: string) {
    visited.add(current);
    path.push(current);
    if (current === endId) {
      allPaths.push([...path]);
    } else {
      for (const neighbor in graph[current] || {}) {
        if (!visited.has(neighbor)) {
          dfs(neighbor);
        }
      }
    }
    path.pop();
    visited.delete(current);
  }

  dfs(startId);
  console.log(`All possible paths from ${startId} to ${endId}:`);
  allPaths.forEach((p, idx) =>
    console.log(`Path ${idx + 1}: ${p.join(" -> ")}`)
  );
  if (allPaths.length === 0) {
    console.log("No paths found.");
  }
};
