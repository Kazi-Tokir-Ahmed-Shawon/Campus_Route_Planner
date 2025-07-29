"use client";

import { useState, useEffect, useCallback } from "react";
import DynamicMap from "@/components/DynamicMap";
import RouteControl from "@/components/RouteControl";
import RouteDetails from "@/components/RouteDetails";
import { FeatureCollection } from "geojson";

interface Location {
  id: string;
  name: string;
}

interface RawLocation {
  name: string;
  label: string;
  lat: number;
  lng: number;
}

interface BackendStatus {
  status: string;
  message: string;
  timestamp: string;
}

export default function Home() {
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [geoJsonData, setGeoJsonData] = useState<FeatureCollection | null>(
    null
  );
  const [locations, setLocations] = useState<Location[]>([]);
  const [route, setRoute] = useState<FeatureCollection | null>(null);
  const [allRoutes, setAllRoutes] = useState<FeatureCollection[]>([]);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [routeDirections, setRouteDirections] = useState<string[] | null>(null);
  const [startPoint, setStartPoint] = useState<[number, number] | null>(null);
  const [endPoint, setEndPoint] = useState<[number, number] | null>(null);
  const [obstacles, setObstacles] = useState<any[]>([]);

  const checkBackendHealth = useCallback(async () => {
    setBackendStatus(null); // Reset status on new check
    try {
      const response = await fetch("http://localhost:5002/api/health");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setBackendStatus(data);
    } catch (err) {
      console.error("Backend connection failed:", err);
      setBackendStatus({
        status: "Error",
        message: "Failed to connect",
        timestamp: new Date().toISOString(),
      });
    }
  }, []);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const response = await fetch("/USW_Treeforest_campus_map.json");
        if (!response.ok) {
          throw new Error(`Failed to fetch GeoJSON: ${response.statusText}`);
        }
        const rawData: { [key: string]: RawLocation } = await response.json();

        const locationList = Object.entries(rawData).map(([id, loc]) => ({
          id: id,
          name: loc.name,
        }));
        setLocations(locationList);

        const features = Object.values(rawData).map((location) => ({
          type: "Feature" as const,
          properties: { name: location.name, label: location.label },
          geometry: {
            type: "Point" as const,
            coordinates: [location.lng, location.lat],
          },
        }));

        setGeoJsonData({ type: "FeatureCollection", features });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    const fetchObstacles = async () => {
      try {
        const response = await fetch("/obstacles.json");
        if (response.ok) {
          const data = await response.json();
          setObstacles(data.obstacles || []);
        }
      } catch (err) {
        // Ignore obstacle fetch errors for now
      }
    };

    checkBackendHealth();
    fetchMapData();
    fetchObstacles();
  }, [checkBackendHealth]);

  const handleRouteFind = async (start: string, end: string) => {
    // 1. Clear previous route
    setRoute(null);
    setAllRoutes([]);
    setRouteDistance(null);
    setRouteDirections(null);
    setStartPoint(null);
    setEndPoint(null);
    setError(null);

    try {
      // 2. Get the routes from our backend
      const restriction = "disabled"; // Hardcoded for now, can be made user-selectable
      const backendResponse = await fetch("http://localhost:5002/api/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start, end, restriction }),
      });

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json();
        throw new Error(
          errorData.error || "Failed to fetch waypoints from backend"
        );
      }

      const { routes } = await backendResponse.json();
      if (!routes || routes.length === 0) throw new Error("No routes found");

      // For each route, fetch OSRM geometry
      const osrmRoutes: FeatureCollection[] = [];
      for (const routeObj of routes) {
        const startCoord = routeObj.waypoints[0];
        const endCoord = routeObj.waypoints[routeObj.waypoints.length - 1];
        const waypointString = `${startCoord[0]},${startCoord[1]};${endCoord[0]},${endCoord[1]}`;
        const osrmUrl = `http://router.project-osrm.org/route/v1/foot/${waypointString}?overview=full&geometries=geojson`;
        const osrmResponse = await fetch(osrmUrl);
        if (!osrmResponse.ok) continue;
        const osrmData = await osrmResponse.json();
        if (
          osrmData.code !== "Ok" ||
          !osrmData.routes ||
          osrmData.routes.length === 0
        ) {
          continue;
        }
        const routeGeometry = osrmData.routes[0].geometry;
        osrmRoutes.push({
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: { isShortest: routeObj.isShortest },
              geometry: routeGeometry,
            },
          ],
        });
      }
      setAllRoutes(osrmRoutes);
      // Set the shortest route as the main highlighted route
      if (osrmRoutes.length > 0) {
        setRoute(osrmRoutes[0]);
        setRouteDistance(routes[0].distance);
        setRouteDirections(routes[0].directions);
        const routeCoords = osrmRoutes[0].features[0].geometry.coordinates;
        setStartPoint([routeCoords[0][1], routeCoords[0][0]]);
        setEndPoint([
          routeCoords[routeCoords.length - 1][1],
          routeCoords[routeCoords.length - 1][0],
        ]);
      }
    } catch (error) {
      console.error("Error finding route:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Campus Map
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Interactive campus navigation and information system
          </p>
        </header>

        <main className="max-w-4xl mx-auto">
          {/* Route Controls */}
          {loading ? (
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-8">
              Loading routing options...
            </div>
          ) : (
            <RouteControl locations={locations} onRouteFind={handleRouteFind} />
          )}

          {/* Route Details */}
          {route && routeDistance && routeDirections && (
            <RouteDetails
              distance={routeDistance}
              directions={routeDirections}
            />
          )}

          {/* Map Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Campus Interactive Map
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
              <DynamicMap
                geoJsonData={geoJsonData}
                routeGeoJson={route}
                allRoutes={allRoutes}
                startPoint={startPoint}
                endPoint={endPoint}
                obstacles={obstacles}
              />
            </div>
            {error && (
              <div
                className="mt-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            )}
          </div>

          {/* Backend Status Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Backend Status
            </h2>

            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={checkBackendHealth}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Check Health
              </button>

              {backendStatus && (
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      backendStatus.status === "OK"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                  <span className="text-sm font-medium">
                    {backendStatus.status === "OK" ? "Connected" : "Error"}
                  </span>
                </div>
              )}
            </div>

            {backendStatus && (
              <div
                className={`border rounded-lg p-4 ${
                  backendStatus.status === "OK"
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Status:
                    </span>
                    <span
                      className={`ml-2 ${
                        backendStatus.status === "OK"
                          ? "text-green-700 dark:text-green-300"
                          : "text-red-700 dark:text-red-300"
                      }`}
                    >
                      {backendStatus.status}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Message:
                    </span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      {backendStatus.message}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Timestamp:
                    </span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      {new Date(backendStatus.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Interactive Map
              </h3>
              <p className="text-gray-600">
                Navigate through campus buildings and facilities.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Real-time Updates
              </h3>
              <p className="text-gray-600">
                Get real-time campus information and announcements.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Campus Directory
              </h3>
              <p className="text-gray-600">
                Find faculty, staff, and department information.
              </p>
            </div>
          </div>
        </main>

        <footer className="text-center mt-16">
          <p className="text-gray-500">
            © 2024 Campus Map. Built with Next.js and Node.js
          </p>
        </footer>
      </div>
    </div>
  );
}
