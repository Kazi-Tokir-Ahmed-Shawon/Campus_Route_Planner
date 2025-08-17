"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROUTING_CONFIG = void 0;
exports.ROUTING_CONFIG = {
    COORDINATE_TO_METERS: 111000,
    OBSTACLE_THRESHOLDS: {
        STRONG_PENALTY: 0.0002,
        MODERATE_PENALTY: 0.0005,
    },
    OBSTACLE_PENALTIES: {
        STRONG: 5000,
        MODERATE: 1000,
    },
    ASTAR: {
        MAX_ITERATIONS: 1000,
        K_SHORTEST_PATHS: 3,
    },
    FRONTEND: {
        OBSTACLE_DETECTION_RADIUS: 0.0002,
        MAX_OBSTACLES_DISPLAY: 3,
    },
};
exports.default = exports.ROUTING_CONFIG;
//# sourceMappingURL=config.js.map