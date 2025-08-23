import { Location } from "../models/Location";
import { Obstacle } from "../models/Obstacle";
import { connectDB, disconnectDB } from "../config/database";
import fs from "fs";
import path from "path";

interface CampusLocation {
  name: string;
  label: string;
  lat: number;
  lng: number;
  room_code?: string;
  welsh_name?: string;
}

interface ObstacleData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  restricted_for: string[];
}

interface CampusData {
  [key: string]: CampusLocation;
}

interface ObstaclesData {
  obstacles: ObstacleData[];
}

export const seedDatabase = async (): Promise<void> => {
  try {
    console.log("🌱 Starting database seeding...");

    // Connect to database
    await connectDB();

    // Check if database is already seeded
    const existingLocations = await Location.countDocuments();
    const existingObstacles = await Obstacle.countDocuments();

    if (existingLocations > 0 || existingObstacles > 0) {
      console.log("⚠️  Database already contains data. Skipping seeding.");
      console.log(
        `Locations: ${existingLocations}, Obstacles: ${existingObstacles}`
      );
      return;
    }

    // Read JSON files
    const allCampusesPath = path.join(
      __dirname,
      "../../../frontend/public/USW_All_Campuses.json"
    );
    const treeforestPath = path.join(
      __dirname,
      "../../../frontend/public/USW_Treeforest_campus_map.json"
    );
    const obstaclesPath = path.join(
      __dirname,
      "../../../frontend/public/obstacles.json"
    );

    if (
      !fs.existsSync(allCampusesPath) ||
      !fs.existsSync(treeforestPath) ||
      !fs.existsSync(obstaclesPath)
    ) {
      console.log(
        "⚠️  JSON files not found. Please ensure the frontend/public directory is accessible."
      );
      return;
    }

    const allCampusesData: CampusData = JSON.parse(
      fs.readFileSync(allCampusesPath, "utf8")
    );
    const treeforestData: CampusData = JSON.parse(
      fs.readFileSync(treeforestPath, "utf8")
    );
    const obstaclesData: ObstaclesData = JSON.parse(
      fs.readFileSync(obstaclesPath, "utf8")
    );

    // Seed all campus locations
    console.log("📍 Seeding all campus locations...");
    for (const [id, location] of Object.entries(allCampusesData)) {
      const newLocation = new Location({
        id,
        name: location.name,
        label: location.label,
        lat: location.lat,
        lng: location.lng,
        type: "all-campus",
      });
      await newLocation.save();
    }
    console.log(
      `✅ Seeded ${Object.keys(allCampusesData).length} all campus locations`
    );

    // Seed treeforest campus locations
    console.log("🌳 Seeding treeforest campus locations...");
    for (const [id, location] of Object.entries(treeforestData)) {
      const newLocation = new Location({
        id,
        name: location.name,
        label: location.label,
        lat: location.lat,
        lng: location.lng,
        type: "tree-house-campus",
        room_code: location.room_code,
        welsh_name: location.welsh_name,
      });
      await newLocation.save();
    }
    console.log(
      `✅ Seeded ${
        Object.keys(treeforestData).length
      } treeforest campus locations`
    );

    // Seed obstacles
    console.log("🚧 Seeding obstacles...");
    for (const obstacle of obstaclesData.obstacles) {
      const newObstacle = new Obstacle({
        id: obstacle.id,
        name: obstacle.name,
        lat: obstacle.lat,
        lng: obstacle.lng,
        restricted_for: obstacle.restricted_for,
      });
      await newObstacle.save();
    }
    console.log(`✅ Seeded ${obstaclesData.obstacles.length} obstacles`);

    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await disconnectDB();
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}
