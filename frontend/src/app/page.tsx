"use client";

import { useState, useEffect } from "react";
import DynamicMap from "@/components/DynamicMap";
import RouteControl from "@/components/RouteControl";
import RouteDetails from "@/components/RouteDetails";
import { FeatureCollection } from "geojson";
import { useStore } from "@/store/useStore";
import { useDataFetching } from "@/hooks/useDataFetching";

interface BackendStatus {
  status: string;
  message: string;
  timestamp: string;
}

export default function Home() {
  // Zustand store
  const {
    treeforestLocations,
    obstacles,
    backendStatus: storeBackendStatus,
  } = useStore();

  // Data fetching hook
  const { fetchAllData } = useDataFetching();

  // Filter obstacles to only show the ones from obstacles.json (not from database)
  const filteredObstacles = obstacles.filter(
    (obs) =>
      obs.id.startsWith("obs_") ||
      [
        "Stairs near Library",
        "Steep Hill behind Tŷ Crawshay",
        "Narrow Alley near Accommodation",
      ].includes(obs.name)
  );

  // Local state
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"planning" | "results">(
    "planning"
  );

  // Trigger data fetching on mount
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Global error handler for unhandled errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Global error caught:", event.error);
      // Prevent the error from crashing the app
      event.preventDefault();
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);
      // Prevent the error from crashing the app
      event.preventDefault();
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, []);

  const [geoJsonData, setGeoJsonData] = useState<FeatureCollection | null>(
    null
  );
  const [route, setRoute] = useState<FeatureCollection | null>(null);
  const [allRoutes, setAllRoutes] = useState<FeatureCollection[]>([]);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [routeDirections, setRouteDirections] = useState<string[] | null>(null);
  const [routeTimeDisplay, setRouteTimeDisplay] = useState<string | undefined>(
    undefined
  );
  const [routeModeInfo, setRouteModeInfo] = useState<
    | {
        walk: boolean;
        cycle: boolean;
        disabled: boolean;
      }
    | undefined
  >(undefined);
  const [startPoint, setStartPoint] = useState<[number, number] | null>(null);
  const [endPoint, setEndPoint] = useState<[number, number] | null>(null);
  const [currentMode, setCurrentMode] = useState<string>("walk");
  const [hasStairs, setHasStairs] = useState<boolean>(false);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        // Use Zustand store data instead of fetching JSON directly
        if (treeforestLocations.length > 0) {
          const features = treeforestLocations.map((location) => ({
            type: "Feature" as const,
            properties: { name: location.name, label: location.label },
            geometry: {
              type: "Point" as const,
              coordinates: [location.lng, location.lat],
            },
          }));

          setGeoJsonData({ type: "FeatureCollection", features });
          setLoading(false);
        }
      } catch (err) {
        console.error("Error setting map data:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        setLoading(false);
      }
    };

    // Update backend status from store
    if (storeBackendStatus === "connected") {
      setBackendStatus({
        status: "OK",
        message: "Connected to database",
        timestamp: new Date().toISOString(),
      });
    } else if (storeBackendStatus === "fallback") {
      setBackendStatus({
        status: "Fallback",
        message: "Using fallback data",
        timestamp: new Date().toISOString(),
      });
    } else if (storeBackendStatus === "disconnected") {
      setBackendStatus({
        status: "Error",
        message: "No data available",
        timestamp: new Date().toISOString(),
      });
    }

    // Fetch data when store data is available
    if (treeforestLocations.length > 0) {
      fetchMapData();
    } else if (storeBackendStatus === "checking") {
      // Still checking backend status, keep loading
      setLoading(true);
    } else if (
      storeBackendStatus === "fallback" ||
      storeBackendStatus === "connected"
    ) {
      // Data should be available, but if not, try to fetch
      if (treeforestLocations.length === 0) {
        // Import and use the data fetching hook
        try {
          fetchAllData();
        } catch (err) {
          console.error("Error fetching data:", err);
          setError("Failed to fetch data");
        }
      }
    }
  }, [treeforestLocations, storeBackendStatus, fetchAllData]);

  const handleRouteFind = async (start: string, end: string, mode: string) => {
    // 1. Clear previous route
    setRoute(null);
    setAllRoutes([]);
    setRouteDistance(null);
    setRouteDirections(null);
    setRouteTimeDisplay(undefined);
    setRouteModeInfo(undefined);
    setStartPoint(null);
    setEndPoint(null);
    setError(null);
    setCurrentMode(mode);
    setHasStairs(false);

    try {
      // 2. Get the routes from our backend
      const restriction = mode; // Use the selected mode
      const backendResponse = await fetch("http://localhost:5001/api/route", {
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
        setRouteTimeDisplay(routes[0].timeDisplay);
        setRouteModeInfo({
          walk: routes[0].modeInfo.walk,
          cycle: routes[0].modeInfo.cycle,
          disabled: routes[0].modeInfo.disabled,
        });

        // Check if route has stairs
        const routeGeometry = osrmRoutes[0].features[0].geometry;
        if (
          routeGeometry.type === "LineString" &&
          "coordinates" in routeGeometry
        ) {
          const routeCoords = routeGeometry.coordinates;
          setStartPoint([routeCoords[0][1], routeCoords[0][0]]);
          setEndPoint([
            routeCoords[routeCoords.length - 1][1],
            routeCoords[routeCoords.length - 1][0],
          ]);

          // Check if any stairs obstacles are near the route
          const stairsObstacles = obstacles.filter(
            (obs) =>
              obs.name.toLowerCase().includes("stairs") ||
              obs.name.toLowerCase().includes("stair")
          );

          const hasStairsInRoute = stairsObstacles.some((obs) => {
            // Check if obstacle is within 50 meters of any route coordinate
            return routeCoords.some((coord) => {
              const distance =
                Math.sqrt(
                  Math.pow(coord[1] - obs.lat, 2) +
                    Math.pow(coord[0] - obs.lng, 2)
                ) * 111139; // Convert to meters
              return distance < 50; // 50 meter threshold
            });
          });

          setHasStairs(hasStairsInRoute);
        }
      }

      // Switch to results tab after finding route
      setActiveTab("results");
    } catch (error) {
      console.error("Error finding route:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-96 sidebar flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-black mb-2">Route Planning</h1>
          <div className="flex items-center">
            <div
              className={`status-indicator ${
                backendStatus?.status === "OK"
                  ? "status-connected"
                  : backendStatus?.status === "Fallback"
                  ? "status-fallback"
                  : "status-disconnected"
              }`}
            ></div>
            <span className="text-sm text-gray-600">
              {backendStatus?.status === "OK"
                ? "Connected"
                : backendStatus?.status === "Fallback"
                ? "Fallback Mode"
                : "Disconnected"}
            </span>
          </div>
        </div>

        {/* Status Notification */}
        {backendStatus && (
          <div
            className={`px-6 py-3 text-sm ${
              backendStatus.status === "OK"
                ? "bg-green-50 text-green-800 border-b border-green-200"
                : backendStatus.status === "Fallback"
                ? "bg-yellow-50 text-yellow-800 border-b border-yellow-200"
                : "bg-red-50 text-red-800 border-b border-red-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span>
                {backendStatus.status === "OK"
                  ? "✅ Connected to backend database"
                  : backendStatus.status === "Fallback"
                  ? "⚠️ Using fallback data (backend unavailable)"
                  : "❌ No data available"}
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-xs opacity-75">
                  {new Date(backendStatus.timestamp).toLocaleTimeString()}
                </span>
                {backendStatus.status !== "OK" && (
                  <button
                    onClick={fetchAllData}
                    className="px-2 py-1 text-xs bg-white bg-opacity-50 hover:bg-opacity-75 rounded border border-current transition-colors"
                    title="Retry connection"
                  >
                    🔄 Retry
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("planning")}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === "planning"
                ? "text-black border-b-2 border-black bg-gray-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            Route Planning
          </button>
          <button
            onClick={() => setActiveTab("results")}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === "results"
                ? "text-black border-b-2 border-black bg-gray-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
            disabled={!route}
          >
            Route Results
            {route && (
              <span className="ml-2 w-2 h-2 bg-green-500 rounded-full inline-block"></span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {/* Route Planning Tab */}
          {activeTab === "planning" && (
            <div className="p-6 h-full">
              {loading ? (
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="text-gray-500">
                    {storeBackendStatus === "checking"
                      ? "Checking backend connection..."
                      : storeBackendStatus === "fallback"
                      ? "Loading fallback data..."
                      : "Loading..."}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <RouteControl
                    locations={treeforestLocations.map((loc) => ({
                      id: loc.id,
                      name: loc.name,
                    }))}
                    onRouteFind={handleRouteFind}
                  />

                  {/* Quick Route Summary */}
                  {route && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-blue-900 mb-2">
                        Route Found!
                      </h3>
                      <p className="text-xs text-blue-700">
                        Click &ldquo;Route Results&rdquo; tab to view details
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Route Results Tab */}
          {activeTab === "results" && (
            <div className="p-6 h-full overflow-y-auto route-results-scroll">
              {route && routeDistance && routeDirections ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between sticky top-0 bg-white pb-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-black">
                      Route Details
                    </h2>
                    <button
                      onClick={() => setActiveTab("planning")}
                      className="text-sm text-gray-500 hover:text-black"
                    >
                      &larr; Back to Planning
                    </button>
                  </div>

                  <RouteDetails
                    distance={routeDistance}
                    directions={routeDirections}
                    mode={currentMode}
                    timeDisplay={routeTimeDisplay}
                    modeInfo={routeModeInfo}
                    hasStairs={hasStairs}
                    obstacles={filteredObstacles}
                  />
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg
                      className="w-16 h-16 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V4m0 0L9 7"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">
                    No route calculated yet
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Go to Route Planning to find a route
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error Display - Always visible at bottom */}
        {error && (
          <div className="p-4 border-t border-gray-200 bg-red-50">
            <div className="text-red-800 text-sm">
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}
      </div>

      {/* Main Map Area */}
      <div className="flex-1 relative">
        <DynamicMap
          geoJsonData={geoJsonData}
          allRoutes={allRoutes}
          startPoint={startPoint}
          endPoint={endPoint}
          obstacles={filteredObstacles}
          currentMode={currentMode}
        />
      </div>
    </div>
  );
}
