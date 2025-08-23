"use client";

import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LatLngExpression, Icon } from "leaflet";
import { FeatureCollection } from "geojson";
import L from "leaflet";
import { useState, useEffect, Component, ReactNode } from "react";

// Simple error boundary component
class MapErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Map error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const defaultIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const startIcon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const endIcon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const stairsIcon = new Icon({
  iconUrl: "/stairs-14-svgrepo-com.svg",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface MapComponentProps {
  geoJsonData: FeatureCollection | null;
  allRoutes?: FeatureCollection[];
  startPoint: [number, number] | null;
  endPoint: [number, number] | null;
  obstacles?: { id: string; name: string; lat: number; lng: number }[];
  currentMode?: string;
}

const MapComponent = ({
  geoJsonData,
  allRoutes = [],
  startPoint,
  endPoint,
  obstacles = [],
  currentMode = "walk",
}: MapComponentProps) => {
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const position: LatLngExpression = [51.589, -3.327]; // Centered on Trefforest campus

  useEffect(() => {
    // Ensure Leaflet is properly initialized
    if (typeof window !== "undefined") {
      setIsMapReady(true);
    }
  }, []);

  if (mapError) {
    return (
      <div className="flex items-center justify-center h-full bg-red-50">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-2">⚠️ Map Error</div>
          <p className="text-red-500 text-sm">{mapError}</p>
          <button
            onClick={() => setMapError(null)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!geoJsonData || !isMapReady) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading Map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <MapErrorBoundary
        fallback={
          <div className="flex items-center justify-center h-full bg-red-50">
            <div className="text-center">
              <div className="text-red-600 text-lg mb-2">⚠️ Map Error</div>
              <p className="text-red-500 text-sm">Failed to load map</p>
              <button
                onClick={() => setMapError(null)}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        }
      >
        <MapContainer
          center={position}
          zoom={16}
          scrollWheelZoom={true}
          className="h-full w-full"
          whenReady={() => {
            // Map is ready, ensure proper sizing
            try {
              // The map will be properly sized automatically
            } catch (error) {
              console.warn("Map ready warning:", error);
            }
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <GeoJSON
            data={geoJsonData}
            pointToLayer={(feature, latlng) => {
              try {
                return L.marker(latlng, { icon: defaultIcon });
              } catch (error) {
                console.warn("Error creating marker:", error);
                return L.marker(latlng);
              }
            }}
            onEachFeature={(feature, layer) => {
              try {
                if (feature.properties && feature.properties.name) {
                  layer.bindPopup(feature.properties.name);
                }
              } catch (error) {
                console.warn("Error binding popup:", error);
              }
            }}
          />
          {/* Render all routes with mode-specific colors */}
          {allRoutes.map((route, idx) => {
            const getRouteColor = () => {
              if (idx === 0) {
                // Main route color based on mode
                switch (currentMode) {
                  case "cycle":
                    return "#22c55e"; // Green for cycling
                  case "disabled":
                    return "#f59e0b"; // Amber for accessibility
                  case "walk":
                  default:
                    return "#3b82f6"; // Blue for walking
                }
              } else {
                return "#6b7280"; // Gray for alternative routes
              }
            };

            return (
              <GeoJSON
                key={idx}
                data={route}
                style={() => ({
                  color: getRouteColor(),
                  weight: idx === 0 ? 5 : 3,
                  opacity: idx === 0 ? 0.8 : 0.4,
                })}
              />
            );
          })}
          {/* Start and End Markers */}
          {startPoint && (
            <Marker position={startPoint} icon={startIcon}>
              <Popup>Start Point</Popup>
            </Marker>
          )}
          {endPoint && (
            <Marker position={endPoint} icon={endIcon}>
              <Popup>Destination</Popup>
            </Marker>
          )}
          {/* Obstacles Markers */}
          {obstacles.map((obs) => (
            <Marker
              key={obs.id}
              position={[obs.lat, obs.lng]}
              icon={stairsIcon}
            >
              <Popup>{obs.name}</Popup>
            </Marker>
          ))}
          <Marker position={position} icon={defaultIcon}>
            <Popup>University of South Wales, Trefforest Campus</Popup>
          </Marker>
        </MapContainer>
      </MapErrorBoundary>
    </div>
  );
};

export default MapComponent;
