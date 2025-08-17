"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllLocations = exports.getLocationById = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dataPath = path_1.default.join(__dirname, "../../frontend/public/USW_Treeforest_campus_map.json");
let locations = {};
try {
    const rawData = fs_1.default.readFileSync(dataPath, "utf-8");
    locations = JSON.parse(rawData);
}
catch (error) {
    console.error("Failed to load or parse campus location data:", error);
}
const getLocationById = (id) => {
    return locations[id];
};
exports.getLocationById = getLocationById;
const getAllLocations = () => {
    return locations;
};
exports.getAllLocations = getAllLocations;
//# sourceMappingURL=data.js.map