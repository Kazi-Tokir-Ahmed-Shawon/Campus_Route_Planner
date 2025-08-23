import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface Location {
  id: string;
  name: string;
  label: string;
  lat: number;
  lng: number;
  type: "all-campus" | "tree-house-campus";
  room_code?: string;
  welsh_name?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Obstacle {
  id: string;
  name: string;
  lat: number;
  lng: number;
  restricted_for: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface AppState {
  // Data
  locations: Location[];
  obstacles: Obstacle[];
  treeforestLocations: Location[];
  allCampusLocations: Location[];

  // Loading states
  loading: {
    locations: boolean;
    obstacles: boolean;
  };

  // Error states
  errors: {
    locations: string | null;
    obstacles: string | null;
  };

  // Backend status
  backendStatus: "connected" | "disconnected" | "checking" | "fallback";

  // Actions
  setLocations: (locations: Location[]) => void;
  setObstacles: (obstacles: Obstacle[]) => void;
  addLocation: (location: Location) => void;
  updateLocation: (id: string, updates: Partial<Location>) => void;
  deleteLocation: (id: string) => void;
  addObstacle: (obstacle: Obstacle) => void;
  updateObstacle: (id: string, updates: Partial<Obstacle>) => void;
  deleteObstacle: (id: string) => void;
  setLoading: (key: "locations" | "obstacles", loading: boolean) => void;
  setError: (key: "locations" | "obstacles", error: string | null) => void;
  setBackendStatus: (
    status: "connected" | "disconnected" | "checking" | "fallback"
  ) => void;
  clearErrors: () => void;
}

export const useStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // Initial state
      locations: [],
      obstacles: [],
      treeforestLocations: [],
      allCampusLocations: [],

      loading: {
        locations: false,
        obstacles: false,
      },

      errors: {
        locations: null,
        obstacles: null,
      },

      backendStatus: "checking",

      // Actions
      setLocations: (locations) => {
        const treeforestLocations = locations.filter(
          (loc) => loc.type === "tree-house-campus"
        );
        const allCampusLocations = locations.filter(
          (loc) => loc.type === "all-campus"
        );

        set({
          locations,
          treeforestLocations,
          allCampusLocations,
        });
      },

      setObstacles: (obstacles) => {
        set({ obstacles });
      },

      addLocation: (location) => {
        const currentLocations = get().locations;
        const newLocations = [...currentLocations, location];
        get().setLocations(newLocations);
      },

      updateLocation: (id, updates) => {
        const currentLocations = get().locations;
        const updatedLocations = currentLocations.map((loc) =>
          loc.id === id ? { ...loc, ...updates } : loc
        );
        get().setLocations(updatedLocations);
      },

      deleteLocation: (id) => {
        const currentLocations = get().locations;
        const filteredLocations = currentLocations.filter(
          (loc) => loc.id !== id
        );
        get().setLocations(filteredLocations);
      },

      addObstacle: (obstacle) => {
        const currentObstacles = get().obstacles;
        set({ obstacles: [...currentObstacles, obstacle] });
      },

      updateObstacle: (id, updates) => {
        const currentObstacles = get().obstacles;
        const updatedObstacles = currentObstacles.map((obs) =>
          obs.id === id ? { ...obs, ...updates } : obs
        );
        set({ obstacles: updatedObstacles });
      },

      deleteObstacle: (id) => {
        const currentObstacles = get().obstacles;
        const filteredObstacles = currentObstacles.filter(
          (obs) => obs.id !== id
        );
        set({ obstacles: filteredObstacles });
      },

      setLoading: (key, loading) => {
        set((state) => ({
          loading: { ...state.loading, [key]: loading },
        }));
      },

      setError: (key, error) => {
        set((state) => ({
          errors: { ...state.errors, [key]: error },
        }));
      },

      setBackendStatus: (status) => {
        set({ backendStatus: status });
      },

      clearErrors: () => {
        set({
          errors: {
            locations: null,
            obstacles: null,
          },
        });
      },
    }),
    {
      name: "campus-map-store",
    }
  )
);
