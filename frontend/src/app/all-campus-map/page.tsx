"use client";

import { useState, useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface CampusLocation {
  id: string;
  name: string;
  label: string;
  lat: number;
  lng: number;
}

interface DirectionsResult {
  distance: string;
  duration: string;
  route: google.maps.LatLng[];
}

export default function AllCampusMapPage() {
  const [campusLocations, setCampusLocations] = useState<CampusLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsService, setDirectionsService] =
    useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer | null>(null);
  const [selectedStart, setSelectedStart] = useState<string>("");
  const [selectedEnd, setSelectedEnd] = useState<string>("");
  const [directionsResult, setDirectionsResult] =
    useState<DirectionsResult | null>(null);
  const [travelMode, setTravelMode] = useState<string>("DRIVING");
  const [apiKey, setApiKey] = useState<string>("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);

  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCampusLocations();
  }, []);

  const fetchCampusLocations = async () => {
    try {
      const response = await fetch("/USW_All_Campuses.json");
      if (response.ok) {
        const data = await response.json();
        const locationsArray = Object.entries(data).map(
          ([id, loc]: [string, unknown]) => ({
            id,
            name: (loc as CampusLocation).name,
            label: (loc as CampusLocation).label,
            lat: (loc as CampusLocation).lat,
            lng: (loc as CampusLocation).lng,
          })
        );
        setCampusLocations(locationsArray);
      }
    } catch (error) {
      console.error("Error fetching campus locations:", error);
    } finally {
      setLoading(false);
    }
  };

  const initializeMap = async () => {
    if (!apiKey || !mapRef.current) return;

    try {
      const loader = new Loader({
        apiKey: apiKey,
        version: "weekly",
        libraries: ["places"],
      });

      const google = await loader.load();

      const mapInstance = new google.maps.Map(mapRef.current, {
        center: { lat: 51.58937482501967, lng: -3.3306255895333994 }, // Treforest campus as center
        zoom: 10,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      });

      const directionsServiceInstance = new google.maps.DirectionsService();
      const directionsRendererInstance = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: "#3B82F6",
          strokeWeight: 5,
          strokeOpacity: 0.8,
        },
      });

      directionsRendererInstance.setMap(mapInstance);

      setMap(mapInstance);
      setDirectionsService(directionsServiceInstance);
      setDirectionsRenderer(directionsRendererInstance);

      // Add markers for all campus locations
      campusLocations.forEach((location) => {
        const marker = new google.maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map: mapInstance,
          title: location.name,
          label: {
            text: location.label,
            className: "campus-marker-label",
          },
        });

        // Add info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-semibold text-lg">${location.name}</h3>
              <p class="text-sm text-gray-600">${location.label}</p>
              <p class="text-xs text-gray-500">${location.lat.toFixed(
                6
              )}, ${location.lng.toFixed(6)}</p>
            </div>
          `,
        });

        marker.addListener("click", () => {
          infoWindow.open(mapInstance, marker);
        });
      });
    } catch (error) {
      console.error("Error initializing map:", error);
      setShowApiKeyInput(true);
    }
  };

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      setShowApiKeyInput(false);
      initializeMap();
    }
  };

  const calculateRoute = async () => {
    if (
      !directionsService ||
      !directionsRenderer ||
      !selectedStart ||
      !selectedEnd
    )
      return;

    const startLocation = campusLocations.find(
      (loc) => loc.id === selectedStart
    );
    const endLocation = campusLocations.find((loc) => loc.id === selectedEnd);

    if (!startLocation || !endLocation) return;

    const request: google.maps.DirectionsRequest = {
      origin: { lat: startLocation.lat, lng: startLocation.lng },
      destination: { lat: endLocation.lat, lng: endLocation.lng },
      travelMode: travelMode as google.maps.TravelMode,
    };

    try {
      const result = await directionsService.route(request);

      if (result.routes && result.routes.length > 0) {
        const route = result.routes[0];
        const leg = route.legs[0];

        directionsRenderer.setDirections(result);

        setDirectionsResult({
          distance: leg.distance?.text || "Unknown",
          duration: leg.duration?.text || "Unknown",
          route: route.overview_path || [],
        });

        // Fit map to show the entire route
        if (map) {
          const bounds = new google.maps.LatLngBounds();
          bounds.extend(request.origin as google.maps.LatLngLiteral);
          bounds.extend(request.destination as google.maps.LatLngLiteral);
          map.fitBounds(bounds);
        }
      }
    } catch (error) {
      console.error("Error calculating route:", error);
      setDirectionsResult(null);
    }
  };

  const clearRoute = () => {
    if (directionsRenderer) {
      directionsRenderer.setDirections({
        routes: [],
        request: {} as google.maps.DirectionsRequest,
      });
    }
    setDirectionsResult(null);
    setSelectedStart("");
    setSelectedEnd("");

    // Reset map view to show all campuses
    if (map) {
      const bounds = new google.maps.LatLngBounds();
      campusLocations.forEach((location) => {
        bounds.extend({ lat: location.lat, lng: location.lng });
      });
      map.fitBounds(bounds);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading campus locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Campus Map</h1>
          <p className="mt-2 text-gray-600">
            View all USW campuses and get real-time directions
          </p>
        </div>

        {/* API Key Input */}
        {showApiKeyInput && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Google Maps API Key Required
            </h2>
            <p className="text-gray-600 mb-4">
              To use the interactive map features, please enter your Google Maps
              API key. You can get one from the{" "}
              <a
                href="https://console.cloud.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Google Cloud Console
              </a>
              .
            </p>
            <form onSubmit={handleApiKeySubmit} className="flex gap-4">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Google Maps API key"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Load Map
              </button>
            </form>
          </div>
        )}

        {/* Route Planning Controls */}
        {!showApiKeyInput && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Plan Route Between Campuses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From
                </label>
                <select
                  value={selectedStart}
                  onChange={(e) => setSelectedStart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select start campus</option>
                  {campusLocations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To
                </label>
                <select
                  value={selectedEnd}
                  onChange={(e) => setSelectedEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select destination campus</option>
                  {campusLocations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Travel Mode
                </label>
                <select
                  value={travelMode}
                  onChange={(e) => setTravelMode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DRIVING">Driving</option>
                  <option value="WALKING">Walking</option>
                  <option value="BICYCLING">Bicycling</option>
                  <option value="TRANSIT">Transit</option>
                </select>
              </div>

              <div className="flex items-end space-x-2">
                <button
                  onClick={calculateRoute}
                  disabled={!selectedStart || !selectedEnd}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Get Route
                </button>
                <button
                  onClick={clearRoute}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Route Results */}
            {directionsResult && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  Route Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-blue-800">Distance:</span>{" "}
                    {directionsResult.distance}
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">Duration:</span>{" "}
                    {directionsResult.duration}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Campus Locations List */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            All Campus Locations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campusLocations.map((location) => (
              <div
                key={location.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-gray-900">{location.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{location.label}</p>
                <p className="text-xs text-gray-500">
                  Coordinates: {location.lat.toFixed(6)},{" "}
                  {location.lng.toFixed(6)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Map Container */}
        {!showApiKeyInput && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Interactive Map
            </h2>
            <div
              ref={mapRef}
              className="w-full h-96 rounded-lg border border-gray-200"
            />
            <p className="text-sm text-gray-500 mt-2">
              Click on markers to see campus information. Use the route planner
              above to get directions between campuses.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
