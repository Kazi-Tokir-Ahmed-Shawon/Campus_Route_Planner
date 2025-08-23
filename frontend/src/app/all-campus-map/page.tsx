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
  const mapRef = useRef<HTMLDivElement>(null);

  // Load campus locations on component mount
  useEffect(() => {
    fetchCampusLocations();
  }, []);

  // Initialize map when locations are loaded
  useEffect(() => {
    if (campusLocations.length > 0 && !map) {
      initializeMap();
    }
  }, [campusLocations, map]);

  const fetchCampusLocations = async () => {
    try {
      const response = await fetch("/USW_All_Campuses.json");
      if (response.ok) {
        const data = await response.json();
        const locationsArray = Object.entries(data).map(([id, loc]) => ({
          id,
          name: (loc as CampusLocation).name,
          label: (loc as CampusLocation).label,
          lat: (loc as CampusLocation).lat,
          lng: (loc as CampusLocation).lng,
        }));
        setCampusLocations(locationsArray);
      }
    } catch (error) {
      console.error("Error fetching campus locations:", error);
    } finally {
      setLoading(false);
    }
  };

  const initializeMap = async () => {
    if (!mapRef.current) return;

    try {
      // Load Google Maps API
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        version: "weekly",
        libraries: ["places"],
      });

      const google = await loader.load();

      // Create map instance
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: { lat: 51.58937482501967, lng: -3.3306255895333994 }, // Treforest campus as center
        zoom: 10,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      });

      // Initialize directions service and renderer
      const directionsServiceInstance = new google.maps.DirectionsService();
      const directionsRendererInstance = new google.maps.DirectionsRenderer({
        suppressMarkers: true, // Don't show default A/B markers
        polylineOptions: {
          strokeColor: "#3B82F6",
          strokeWeight: 5,
          strokeOpacity: 0.8,
        },
      });

      directionsRendererInstance.setMap(mapInstance);

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
            <div style="padding: 10px; min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${
                location.name
              }</h3>
              <p style="margin: 0 0 4px 0; color: #666;">${location.label}</p>
              <p style="margin: 0; font-size: 12px; color: #999;">${location.lat.toFixed(
                6
              )}, ${location.lng.toFixed(6)}</p>
            </div>
          `,
        });

        marker.addListener("click", () => {
          infoWindow.open(mapInstance, marker);
        });
      });

      // Fit map to show all markers
      if (campusLocations.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        campusLocations.forEach((location) => {
          bounds.extend({ lat: location.lat, lng: location.lng });
        });
        mapInstance.fitBounds(bounds);
      }

      setMap(mapInstance);
      setDirectionsService(directionsServiceInstance);
      setDirectionsRenderer(directionsRendererInstance);
    } catch (error) {
      console.error("Error initializing map:", error);
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
            View all USW campuses across Wales
          </p>
        </div>

        {/* Campus Locations Summary */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Campus Locations ({campusLocations.length})
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

        {/* Route Planning Controls */}
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

        {/* Map Container */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Interactive Map
          </h2>
          <div
            ref={mapRef}
            className="w-full h-96 rounded-lg border border-gray-200"
          />
          <p className="text-sm text-gray-500 mt-2">
            Click on markers to see campus information. The map automatically
            centers to show all campuses.
          </p>
        </div>
      </div>
    </div>
  );
}
