"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const data_1 = require("./data");
const graph_1 = require("./graph");
const astar_1 = require("./astar");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
}));
app.use((0, morgan_1.default)("combined"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        message: "Backend server is running",
        timestamp: new Date().toISOString(),
    });
});
app.get("/api/hello", (req, res) => {
    res.json({
        message: "Hello from the backend!",
        timestamp: new Date().toISOString(),
    });
});
app.post("/api/route", async (req, res) => {
    const { start, end, restriction } = req.body;
    if (!start || !end) {
        return res
            .status(400)
            .json({ error: "Start and end points are required." });
    }
    const startLocation = (0, data_1.getLocationById)(start);
    const endLocation = (0, data_1.getLocationById)(end);
    if (!startLocation || !endLocation) {
        return res.status(404).json({ error: "One or both locations not found." });
    }
    const restrictionType = restriction || "disabled";
    const { adjacencyList, allNodes } = (0, graph_1.buildGraphWithObstacles)(restrictionType);
    (0, astar_1.printAllPaths)(adjacencyList, "7", "9");
    const k = 3;
    const routes = (0, astar_1.findKShortestPaths)(adjacencyList, allNodes, start, end, k);
    if (!routes || routes.length === 0) {
        const modeDisplayName = restrictionType === "walk"
            ? "pedestrian"
            : restrictionType === "cycle"
                ? "cycling"
                : restrictionType === "disabled"
                    ? "accessibility"
                    : restrictionType;
        return res.status(404).json({
            error: `No ${modeDisplayName} route found between the selected locations. This may be due to obstacles or restrictions that block all possible paths. Try selecting a different mode or different start/end points.`,
        });
    }
    console.log(`Found ${routes.length} route(s) for ${start} -> ${end} (restriction: ${restrictionType})`);
    routes.forEach((r, idx) => console.log(`Route ${idx + 1}: ${r.path ? r.path.join(" -> ") : "no path"}`));
    const formattedRoutes = routes.map((result, idx) => {
        const waypoints = result.path.map((id) => {
            const location = allNodes[id];
            return [location.lng, location.lat];
        });
        const distanceInMeters = Math.round(result.distance);
        const timeInSeconds = (0, graph_1.calculateTime)(distanceInMeters, restrictionType);
        const timeInMinutes = Math.round(timeInSeconds / 60);
        const timeDisplay = timeInMinutes < 1 ?
            `${Math.round(timeInSeconds)}s` :
            `${timeInMinutes}m ${Math.round(timeInSeconds % 60)}s`;
        const directions = result.path.map((id, index) => {
            const name = (0, data_1.getLocationById)(id)?.name || `Intersection ${id}`;
            if (index === 0)
                return `Start at ${name}`;
            return `Proceed to ${name}`;
        });
        directions.push(`You have arrived.`);
        return {
            waypoints,
            distance: distanceInMeters,
            time: timeInSeconds,
            timeDisplay,
            directions,
            isShortest: idx === 0,
            mode: restrictionType,
            modeInfo: {
                walk: restrictionType === 'walk',
                cycle: restrictionType === 'cycle',
                disabled: restrictionType === 'disabled'
            }
        };
    });
    return res.json({
        routes: formattedRoutes,
        mode: restrictionType,
        summary: {
            totalRoutes: formattedRoutes.length,
            shortestDistance: formattedRoutes[0].distance,
            shortestTime: formattedRoutes[0].timeDisplay,
            mode: restrictionType
        }
    });
});
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: "Something went wrong!",
        message: process.env.NODE_ENV === "development"
            ? err.message
            : "Internal server error",
    });
});
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
});
//# sourceMappingURL=server.js.map