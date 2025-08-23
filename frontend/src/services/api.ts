import { Location, Obstacle } from "@/store/useStore";

interface JSONLocation {
  name: string;
  label: string;
  lat: number;
  lng: number;
  room_code?: string;
  welsh_name?: string;
}

const API_BASE_URL = "http://localhost:5001/api";

// Helper function to check if backend is available
const isBackendAvailable = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(1500), // 1.5 second timeout for faster fallback
    });
    return response.ok;
  } catch {
    return false;
  }
};

// API Service Class
export class ApiService {
  // Locations
  static async getLocations(
    type?: "all-campus" | "tree-house-campus"
  ): Promise<Location[]> {
    try {
      if (await isBackendAvailable()) {
        const url = type
          ? `${API_BASE_URL}/locations?type=${type}`
          : `${API_BASE_URL}/locations`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          console.log(`Loaded ${data.length} locations from backend`);
          return data;
        }
      }
    } catch (error) {
      console.warn("Backend unavailable, falling back to JSON files:", error);
    }

    // Fallback to JSON files
    console.log("Loading locations from JSON fallback files");
    return this.getLocationsFromJSON(type);
  }

  static async createLocation(
    location: Omit<Location, "createdAt" | "updatedAt">
  ): Promise<Location> {
    const response = await fetch(`${API_BASE_URL}/locations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(location),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create location");
    }

    return await response.json();
  }

  static async updateLocation(
    id: string,
    updates: Partial<Location>
  ): Promise<Location> {
    const response = await fetch(`${API_BASE_URL}/locations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update location");
    }

    return await response.json();
  }

  static async deleteLocation(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/locations/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete location");
    }
  }

  // Obstacles
  static async getObstacles(): Promise<Obstacle[]> {
    try {
      if (await isBackendAvailable()) {
        const response = await fetch(`${API_BASE_URL}/obstacles`);
        if (response.ok) {
          const data = await response.json();
          console.log(`Loaded ${data.length} obstacles from backend`);
          return data;
        }
      }
    } catch (error) {
      console.warn("Backend unavailable, falling back to JSON files:", error);
    }

    // Fallback to JSON files
    console.log("Loading obstacles from JSON fallback files");
    return this.getObstaclesFromJSON();
  }

  static async createObstacle(
    obstacle: Omit<Obstacle, "createdAt" | "updatedAt">
  ): Promise<Obstacle> {
    const response = await fetch(`${API_BASE_URL}/obstacles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(obstacle),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create obstacle");
    }

    return await response.json();
  }

  static async updateObstacle(
    id: string,
    updates: Partial<Obstacle>
  ): Promise<Obstacle> {
    const response = await fetch(`${API_BASE_URL}/obstacles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update obstacle");
    }

    return await response.json();
  }

  static async deleteObstacle(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/obstacles/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete obstacle");
    }
  }

  // Health check
  static async checkHealth(): Promise<{
    status: string;
    message: string;
    timestamp: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Fallback response
    }

    // Check if we can load fallback data
    try {
      const [locations, obstacles] = await Promise.all([
        this.getLocationsFromJSON(),
        this.getObstaclesFromJSON(),
      ]);

      if (locations.length > 0 || obstacles.length > 0) {
        return {
          status: "Fallback",
          message: "Backend unavailable, using fallback data",
          timestamp: new Date().toISOString(),
        };
      }
    } catch {
      // Fallback data also failed
    }

    return {
      status: "Error",
      message: "Backend unavailable and no fallback data",
      timestamp: new Date().toISOString(),
    };
  }

  // JSON Fallback Methods
  private static async getLocationsFromJSON(
    type?: "all-campus" | "tree-house-campus"
  ): Promise<Location[]> {
    try {
      if (type === "all-campus") {
        const response = await fetch("/USW_All_Campuses.json");
        const data = await response.json();
        return Object.entries(data).map(([id, loc]) => {
          const location = loc as JSONLocation;
          return {
            id,
            name: location.name,
            label: location.label,
            lat: location.lat,
            lng: location.lng,
            type: "all-campus" as const,
          };
        });
      } else if (type === "tree-house-campus") {
        const response = await fetch("/USW_Treeforest_campus_map.json");
        const data = await response.json();
        return Object.entries(data).map(([id, loc]) => {
          const location = loc as JSONLocation;
          return {
            id,
            name: location.name,
            label: location.label,
            lat: location.lat,
            lng: location.lng,
            type: "tree-house-campus" as const,
            room_code: location.room_code,
            welsh_name: location.welsh_name,
          };
        });
      } else {
        // Get both types
        const [allCampus, treeforest] = await Promise.all([
          this.getLocationsFromJSON("all-campus"),
          this.getLocationsFromJSON("tree-house-campus"),
        ]);
        return [...allCampus, ...treeforest];
      }
    } catch (error) {
      console.error("Error loading JSON fallback:", error);
      return [];
    }
  }

  private static async getObstaclesFromJSON(): Promise<Obstacle[]> {
    try {
      const response = await fetch("/obstacles.json");
      const data = await response.json();
      return data.obstacles || [];
    } catch (error) {
      console.error("Error loading obstacles JSON fallback:", error);
      return [];
    }
  }
}
