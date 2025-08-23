import fs from "fs";
import path from "path";

interface Location {
  name: string;
  label: string;
  lat: number;
  lng: number;
}

const dataPath = path.join(
  __dirname,
  "../../frontend/public/USW_Treeforest_campus_map.json"
);
let locations: { [key: string]: Location } = {};

try {
  const rawData = fs.readFileSync(dataPath, "utf-8");
  locations = JSON.parse(rawData);
} catch (error) {
  console.error("Failed to load or parse campus location data:", error);
  // In a real application, you might want to handle this more gracefully
  // For now, we'll proceed with an empty locations object on error.
}

export const getLocationById = (id: string): Location | undefined => {
  return locations[id];
};

export const getAllLocations = (): { [key: string]: Location } => {
  return locations;
};
