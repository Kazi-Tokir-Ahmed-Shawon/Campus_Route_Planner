"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = void 0;
const Location_1 = require("../models/Location");
const Obstacle_1 = require("../models/Obstacle");
const database_1 = require("../config/database");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...');
        await (0, database_1.connectDB)();
        const existingLocations = await Location_1.Location.countDocuments();
        const existingObstacles = await Obstacle_1.Obstacle.countDocuments();
        if (existingLocations > 0 || existingObstacles > 0) {
            console.log('⚠️  Database already contains data. Skipping seeding.');
            return;
        }
        const allCampusesPath = path_1.default.join(__dirname, '../../../frontend/public/USW_All_Campuses.json');
        const treeforestPath = path_1.default.join(__dirname, '../../../frontend/public/USW_Treeforest_campus_map.json');
        const obstaclesPath = path_1.default.join(__dirname, '../../../frontend/public/obstacles.json');
        if (!fs_1.default.existsSync(allCampusesPath) || !fs_1.default.existsSync(treeforestPath) || !fs_1.default.existsSync(obstaclesPath)) {
            console.log('⚠️  JSON files not found. Please ensure the frontend/public directory is accessible.');
            return;
        }
        const allCampusesData = JSON.parse(fs_1.default.readFileSync(allCampusesPath, 'utf8'));
        const treeforestData = JSON.parse(fs_1.default.readFileSync(treeforestPath, 'utf8'));
        const obstaclesData = JSON.parse(fs_1.default.readFileSync(obstaclesPath, 'utf8'));
        console.log('📍 Seeding all campus locations...');
        for (const [id, location] of Object.entries(allCampusesData)) {
            const newLocation = new Location_1.Location({
                id,
                name: location.name,
                label: location.label,
                lat: location.lat,
                lng: location.lng,
                type: 'all-campus'
            });
            await newLocation.save();
        }
        console.log(`✅ Seeded ${Object.keys(allCampusesData).length} all campus locations`);
        console.log('🌳 Seeding treeforest campus locations...');
        for (const [id, location] of Object.entries(treeforestData)) {
            const newLocation = new Location_1.Location({
                id,
                name: location.name,
                label: location.label,
                lat: location.lat,
                lng: location.lng,
                type: 'tree-house-campus',
                room_code: location.room_code,
                welsh_name: location.welsh_name
            });
            await newLocation.save();
        }
        console.log(`✅ Seeded ${Object.keys(treeforestData).length} treeforest campus locations`);
        console.log('🚧 Seeding obstacles...');
        for (const obstacle of obstaclesData.obstacles) {
            const newObstacle = new Obstacle_1.Obstacle({
                id: obstacle.id,
                name: obstacle.name,
                lat: obstacle.lat,
                lng: obstacle.lng,
                restricted_for: obstacle.restricted_for
            });
            await newObstacle.save();
        }
        console.log(`✅ Seeded ${obstaclesData.obstacles.length} obstacles`);
        console.log('🎉 Database seeding completed successfully!');
    }
    catch (error) {
        console.error('❌ Error seeding database:', error);
    }
    finally {
        await (0, database_1.disconnectDB)();
    }
};
exports.seedDatabase = seedDatabase;
if (require.main === module) {
    (0, exports.seedDatabase)();
}
//# sourceMappingURL=seedData.js.map