"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printAllPaths = exports.findKShortestPaths = exports.findPath = void 0;
const heuristic = (loc1, loc2) => {
    const R = 6371000;
    const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
    const dLng = ((loc2.lng - loc1.lng) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((loc1.lat * Math.PI) / 180) *
            Math.cos((loc2.lat * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};
const findPath = (graph, locations, startId, endId) => {
    const openSet = [];
    const closedSet = new Set();
    const startNode = { id: startId, f: 0, g: 0, h: 0, parent: null };
    startNode.h = heuristic(locations[startId], locations[endId]);
    startNode.f = startNode.h;
    openSet.push(startNode);
    while (openSet.length > 0) {
        openSet.sort((a, b) => a.f - b.f);
        const currentNode = openSet.shift();
        if (!currentNode) {
            return null;
        }
        if (currentNode.id === endId) {
            const path = [];
            let temp = currentNode;
            while (temp) {
                path.push(temp.id);
                temp = temp.parent;
            }
            let totalDistance = 0;
            for (let i = 0; i < path.length - 1; i++) {
                const currentId = path[i];
                const nextId = path[i + 1];
                if (graph[currentId] && graph[currentId][nextId] !== undefined) {
                    totalDistance += graph[currentId][nextId];
                }
            }
            return { path: path.reverse(), distance: totalDistance };
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
            }
            else if (gScore < neighborNode.g) {
                neighborNode.parent = currentNode;
                neighborNode.g = gScore;
                neighborNode.f = neighborNode.g + neighborNode.h;
            }
        }
    }
    return null;
};
exports.findPath = findPath;
const findKShortestPaths = (graph, locations, startId, endId, k) => {
    const paths = [];
    const removedEdges = [];
    const removeEdge = (from, to) => {
        if (graph[from] && graph[from][to] !== undefined) {
            removedEdges.push([from, to, graph[from][to]]);
            delete graph[from][to];
        }
        if (graph[to] && graph[to][from] !== undefined) {
            removedEdges.push([to, from, graph[to][from]]);
            delete graph[to][from];
        }
    };
    const restoreEdges = () => {
        for (const [from, to, weight] of removedEdges) {
            if (!graph[from])
                graph[from] = {};
            graph[from][to] = weight;
        }
        removedEdges.length = 0;
    };
    const firstPath = (0, exports.findPath)(graph, locations, startId, endId);
    if (!firstPath)
        return [];
    paths.push(firstPath);
    for (let i = 1; i < k; i++) {
        let found = false;
        for (let j = 0; j < paths[i - 1].path.length - 1; j++) {
            const from = paths[i - 1].path[j];
            const to = paths[i - 1].path[j + 1];
            removeEdge(from, to);
            const altPath = (0, exports.findPath)(graph, locations, startId, endId);
            restoreEdges();
            if (altPath &&
                !paths.some((p) => p.path.join() === altPath.path.join())) {
                paths.push(altPath);
                found = true;
                break;
            }
        }
        if (!found)
            break;
    }
    paths.sort((a, b) => a.distance - b.distance);
    return paths;
};
exports.findKShortestPaths = findKShortestPaths;
const printAllPaths = (graph, startId, endId) => {
    const allPaths = [];
    const visited = new Set();
    const path = [];
    function dfs(current) {
        visited.add(current);
        path.push(current);
        if (current === endId) {
            allPaths.push([...path]);
        }
        else {
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
    allPaths.forEach((p, idx) => console.log(`Path ${idx + 1}: ${p.join(" -> ")}`));
    if (allPaths.length === 0) {
        console.log("No paths found.");
    }
};
exports.printAllPaths = printAllPaths;
//# sourceMappingURL=astar.js.map