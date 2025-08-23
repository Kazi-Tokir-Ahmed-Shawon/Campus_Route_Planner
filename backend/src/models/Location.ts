import mongoose, { Document, Schema } from "mongoose";

export interface ILocation extends Document {
  id: string;
  name: string;
  label: string;
  lat: number;
  lng: number;
  type: "all-campus" | "tree-house-campus";
  room_code?: string;
  welsh_name?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema = new Schema<ILocation>(
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
    label: {
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
    type: {
      type: String,
      required: true,
      enum: ["all-campus", "tree-house-campus"],
      index: true,
    },
    room_code: {
      type: String,
      required: false,
    },
    welsh_name: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "locations",
  }
);

// Compound index for efficient queries
LocationSchema.index({ type: 1, lat: 1, lng: 1 });

export const Location = mongoose.model<ILocation>("Location", LocationSchema);
