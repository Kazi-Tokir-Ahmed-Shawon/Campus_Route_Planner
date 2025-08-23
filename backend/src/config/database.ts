import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/campus-db";

export const connectDB = async (): Promise<void> => {
  try {
    if (MONGODB_URI === "mongodb://localhost:27017/campus-db") {
      console.log(
        "⚠️  MongoDB URI not configured. Please set MONGODB_URI in your .env file"
      );
      return;
    }

    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log("✅ MongoDB disconnected successfully");
  } catch (error) {
    console.error("❌ MongoDB disconnection error:", error);
  }
};
