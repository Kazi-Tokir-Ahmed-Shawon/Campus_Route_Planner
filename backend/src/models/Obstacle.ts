import mongoose, { Document, Schema } from "mongoose";

export interface IObstacle extends Document {
  id: string;
  name: string;
  lat: number;
  lng: number;
  restricted_for: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ObstacleSchema = new Schema<IObstacle>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    restricted_for: [
      {
        type: String,
        enum: ["walk", "cycle", "disabled"],
        required: true,
      },
    ],
  },
  {
    timestamps: true,
    collection: "obstacles",
  }
);

// Index for efficient queries
ObstacleSchema.index({ lat: 1, lng: 1 });

export const Obstacle = mongoose.model<IObstacle>("Obstacle", ObstacleSchema);
