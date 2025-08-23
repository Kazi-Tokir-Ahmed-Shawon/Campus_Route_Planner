"use client";

import { useState, useEffect, useCallback } from "react";
import { useStore } from "@/store/useStore";
import { ApiService } from "@/services/api";
import { Location } from "@/store/useStore";

export default function AdminPage() {
  // Zustand store
  const {
    locations,
    obstacles,
    setLocations,
    setObstacles,
    addLocation,
    addObstacle,
  } = useStore();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"locations" | "obstacles">(
    "locations"
  );

  // Form states for new location
  const [newLocation, setNewLocation] = useState({
    name: "",
    label: "",
    lat: "",
    lng: "",
    type: "tree-house-campus" as "all-campus" | "tree-house-campus",
  });

  // Form states for new obstacle
  const [newObstacle, setNewObstacle] = useState({
    name: "",
    lat: "",
    lng: "",
    restricted_for: [] as string[],
  });

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = useCallback(async () => {
    try {
      // Fetch data using API service with fallback
      const [locationsData, obstaclesData] = await Promise.all([
        ApiService.getLocations(),
        ApiService.getObstacles(),
      ]);

      setLocations(locationsData);
      setObstacles(obstaclesData);
    } catch {
      setMessage({ type: "error", text: "Failed to fetch data" });
    } finally {
      setLoading(false);
    }
  }, [setLocations, setObstacles]);

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !newLocation.name ||
      !newLocation.label ||
      !newLocation.lat ||
      !newLocation.lng
    ) {
      setMessage({ type: "error", text: "Please fill in all fields" });
      return;
    }

    try {
      const newId = (locations.length + 1001).toString();
      const locationData = {
        id: newId,
        name: newLocation.name,
        label: newLocation.label,
        lat: parseFloat(newLocation.lat),
        lng: parseFloat(newLocation.lng),
        type: newLocation.type,
      };

      // Create location in backend
      const createdLocation = await ApiService.createLocation(locationData);
      addLocation(createdLocation);

      // Reset form
      setNewLocation({
        name: "",
        label: "",
        lat: "",
        lng: "",
        type: "tree-house-campus",
      });
      setMessage({
        type: "success",
        text: "New campus location added successfully!",
      });

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to add location",
      });
    }
  };

  const handleAddObstacle = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newObstacle.name || !newObstacle.lat || !newObstacle.lng) {
      setMessage({ type: "error", text: "Please fill in all fields" });
      return;
    }

    try {
      const newId = (obstacles.length + 1).toString();
      const obstacleData = {
        id: newId,
        name: newObstacle.name,
        lat: parseFloat(newObstacle.lat),
        lng: parseFloat(newObstacle.lng),
        restricted_for: newObstacle.restricted_for,
      };

      // Create obstacle in backend
      const createdObstacle = await ApiService.createObstacle(obstacleData);
      addObstacle(createdObstacle);

      // Reset form
      setNewObstacle({ name: "", lat: "", lng: "", restricted_for: [] });
      setMessage({ type: "success", text: "New obstacle added successfully!" });

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to add obstacle",
      });
    }
  };

  const handleRestrictionChange = (restriction: string, checked: boolean) => {
    if (checked) {
      setNewObstacle((prev) => ({
        ...prev,
        restricted_for: [...prev.restricted_for, restriction],
      }));
    } else {
      setNewObstacle((prev) => ({
        ...prev,
        restricted_for: prev.restricted_for.filter((r) => r !== restriction),
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="mt-2 text-gray-600">
            Manage campus locations and obstacles
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-md ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab("locations")}
            className={`py-3 px-6 text-sm font-medium transition-colors ${
              activeTab === "locations"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            Campus Locations (
            {locations.filter((loc) => loc.type === "tree-house-campus")
              .length +
              locations.filter((loc) => loc.type === "all-campus").length}
            )
          </button>
          <button
            onClick={() => setActiveTab("obstacles")}
            className={`py-3 px-6 text-sm font-medium transition-colors ${
              activeTab === "obstacles"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            Obstacles ({obstacles.length})
          </button>
        </div>

        {/* Campus Locations Tab */}
        {activeTab === "locations" && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Add New Campus Location
              </h2>
              <form onSubmit={handleAddLocation} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Campus Name
                    </label>
                    <input
                      type="text"
                      value={newLocation.name}
                      onChange={(e) =>
                        setNewLocation((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., University of South Wales, New Campus"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Label
                    </label>
                    <input
                      type="text"
                      value={newLocation.label}
                      onChange={(e) =>
                        setNewLocation((prev) => ({
                          ...prev,
                          label: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., New Campus"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={newLocation.lat}
                      onChange={(e) =>
                        setNewLocation((prev) => ({
                          ...prev,
                          lat: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 51.58937482501967"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={newLocation.lng}
                      onChange={(e) =>
                        setNewLocation((prev) => ({
                          ...prev,
                          lng: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., -3.3306255895333994"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={newLocation.type}
                      onChange={(e) =>
                        setNewLocation((prev) => ({
                          ...prev,
                          type: e.target.value as
                            | "all-campus"
                            | "tree-house-campus",
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="tree-house-campus">
                        Treeforest Campus
                      </option>
                      <option value="all-campus">All Campus</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add Location
                </button>
              </form>
            </div>

            {/* Treeforest Campus Locations */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Treeforest Campus Locations (
                {
                  locations.filter((loc) => loc.type === "tree-house-campus")
                    .length
                }
                )
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Label
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Room Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Coordinates
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {locations
                      .filter(
                        (location: Location) =>
                          location.type === "tree-house-campus"
                      )
                      .map((location: Location) => (
                        <tr key={location.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {location.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {location.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {location.label}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {location.room_code || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* All Campus Locations */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                All Campus Locations (
                {locations.filter((loc) => loc.type === "all-campus").length})
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Label
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Coordinates
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {locations
                      .filter(
                        (location: Location) => location.type === "all-campus"
                      )
                      .map((location: Location) => (
                        <tr key={location.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {location.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {location.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {location.label}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Obstacles Tab */}
        {activeTab === "obstacles" && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Add New Obstacle
              </h2>
              <form onSubmit={handleAddObstacle} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Obstacle Name
                    </label>
                    <input
                      type="text"
                      value={newObstacle.name}
                      onChange={(e) =>
                        setNewObstacle((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Stairs, Elevator, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={newObstacle.lat}
                      onChange={(e) =>
                        setNewObstacle((prev) => ({
                          ...prev,
                          lat: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 51.58937482501967"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={newObstacle.lng}
                      onChange={(e) =>
                        setNewObstacle((prev) => ({
                          ...prev,
                          lng: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., -3.3306255895333994"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Access Restrictions
                  </label>
                  <div className="space-y-2">
                    {["walk", "cycle", "disabled"].map((restriction) => (
                      <label key={restriction} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newObstacle.restricted_for.includes(
                            restriction
                          )}
                          onChange={(e) =>
                            handleRestrictionChange(
                              restriction,
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          {restriction}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add Obstacle
                </button>
              </form>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Existing Obstacles
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Coordinates
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Restrictions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {obstacles.map((obstacle) => (
                      <tr key={obstacle.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {obstacle.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {obstacle.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {obstacle.lat.toFixed(6)}, {obstacle.lng.toFixed(6)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {obstacle.restricted_for.length > 0
                            ? obstacle.restricted_for.join(", ")
                            : "None"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
