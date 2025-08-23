"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DISTANCE_MULTIPLIERS = exports.SPEEDS = exports.calculateTime = exports.calculateDistance = exports.buildGraphFromJSON = exports.buildGraphWithObstacles = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const data_1 = require("./data");
const SPEEDS = {
    walk: 1.4,
    cycle: 4.2,
    disabled: 1.0,
    default: 1.4,
};
exports.SPEEDS = SPEEDS;
const DISTANCE_MULTIPLIERS = {
    walk: 1.0,
    cycle: 0.9,
    disabled: 1.2,
    default: 1.0,
};
exports.DISTANCE_MULTIPLIERS = DISTANCE_MULTIPLIERS;
const calculateDistance = (loc1, loc2) => {
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
exports.calculateDistance = calculateDistance;
const calculateTime = (distance, mode) => {
    const speed = SPEEDS[mode] || SPEEDS.default;
    return distance / speed;
};
exports.calculateTime = calculateTime;
const loadObstacles = () => {
    const obstaclesPath = path_1.default.join(__dirname, "obstacles.json");
    const data = JSON.parse(fs_1.default.readFileSync(obstaclesPath, "utf-8"));
    return data.obstacles || [];
};
const buildGraphWithObstacles = (restriction) => {
    const buildingLocations = (0, data_1.getAllLocations)();
    const graphPath = path_1.default.join(__dirname, "campus_graph.json");
    const graphData = JSON.parse(fs_1.default.readFileSync(graphPath, "utf-8"));
    const obstacles = loadObstacles();
    const restrictedObstacles = obstacles.filter((obs) => obs.restricted_for.includes(restriction));
    const getObstaclePenalty = (lat, lng, mode) => {
        let penalty = 0;
        for (const obs of restrictedObstacles) {
            const distance = Math.sqrt(Math.pow(lat - obs.lat, 2) + Math.pow(lng - obs.lng, 2));
            if (distance < 0.0005) {
                switch (mode) {
                    case "walk":
                        penalty += 500;
                        break;
                    case "cycle":
                        penalty += 1000;
                        break;
                    case "disabled":
                        penalty += 2000;
                        break;
                    default:
                        penalty += 500;
                }
            }
        }
        return penalty;
    };
    const allNodes = {};
    for (const [id, loc] of Object.entries(buildingLocations)) {
        allNodes[id] = { lat: loc.lat, lng: loc.lng };
    }
    for (const node of graphData.nodes) {
        allNodes[node.id] = { lat: node.lat, lng: node.lng };
    }
    const adjacencyList = {};
    for (const edge of graphData.edges) {
        const sourceNode = allNodes[edge.source];
        const targetNode = allNodes[edge.target];
        if (sourceNode && targetNode) {
            const baseDistance = calculateDistance(sourceNode, targetNode);
            const modeMultiplier = DISTANCE_MULTIPLIERS[restriction] || DISTANCE_MULTIPLIERS.default;
            const adjustedDistance = baseDistance * modeMultiplier;
            const sourcePenalty = getObstaclePenalty(sourceNode.lat, sourceNode.lng, restriction);
            const targetPenalty = getObstaclePenalty(targetNode.lat, targetNode.lng, restriction);
            const totalPenalty = sourcePenalty + targetPenalty;
            const finalDistance = adjustedDistance + totalPenalty;
            if (!adjacencyList[edge.source])
                adjacencyList[edge.source] = {};
            if (!adjacencyList[edge.target])
                adjacencyList[edge.target] = {};
            adjacencyList[edge.source][edge.target] = finalDistance;
            adjacencyList[edge.target][edge.source] = finalDistance;
        }
    }
    return { adjacencyList, allNodes };
};
exports.buildGraphWithObstacles = buildGraphWithObstacles;
const buildGraphFromJSON = () => {
    const buildingLocations = (0, data_1.getAllLocations)();
    const graphPath = path_1.default.join(__dirname, "campus_graph.json");
    const graphData = JSON.parse(fs_1.default.readFileSync(graphPath, "utf-8"));
    const allNodes = {};
    for (const [id, loc] of Object.entries(buildingLocations)) {
        allNodes[id] = { lat: loc.lat, lng: loc.lng };
    }
    for (const node of graphData.nodes) {
        allNodes[node.id] = { lat: node.lat, lng: node.lng };
    }
    const adjacencyList = {};
    for (const edge of graphData.edges) {
        const sourceNode = allNodes[edge.source];
        const targetNode = allNodes[edge.target];
        if (sourceNode && targetNode) {
            const distance = calculateDistance(sourceNode, targetNode);
            if (!adjacencyList[edge.source])
                adjacencyList[edge.source] = {};
            if (!adjacencyList[edge.target])
                adjacencyList[edge.target] = {};
            adjacencyList[edge.source][edge.target] = distance;
            adjacencyList[edge.target][edge.source] = distance;
        }
    }
    return { adjacencyList, allNodes };
};
exports.buildGraphFromJSON = buildGraphFromJSON;
//# sourceMappingURL=graph.js.map