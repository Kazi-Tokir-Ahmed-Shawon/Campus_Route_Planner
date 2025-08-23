import { Location } from "../models/Location";
import { Obstacle } from "../models/Obstacle";
import { connectDB, disconnectDB } from "../config/database";

export const clearDatabase = async (): Promise<void> => {
  try {
    console.log("🗑️  Starting database cleanup...");

    // Connect to database
    await connectDB();

    // Drop collections completely
    console.log("🧹 Dropping locations collection...");
    await Location.collection
      .drop()
      .catch(() => console.log("Locations collection didn't exist"));
    console.log("✅ Locations collection dropped");

    console.log("🧹 Dropping obstacles collection...");
    await Obstacle.collection
      .drop()
      .catch(() => console.log("Obstacles collection didn't exist"));
    console.log("✅ Obstacles collection dropped");

    console.log("🎉 Database cleanup completed successfully!");
  } catch (error) {
    console.error("❌ Error clearing database:", error);
  } finally {
    await disconnectDB();
  }
};

// Run cleanup if this file is executed directly
if (require.main === module) {
  clearDatabase();
}
