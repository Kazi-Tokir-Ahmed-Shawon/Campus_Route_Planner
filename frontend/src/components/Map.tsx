"use client";

import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LatLngExpression, Icon } from "leaflet";
import { FeatureCollection } from "geojson";
import L from "leaflet";

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

interface MapComponentProps {
  geoJsonData: FeatureCollection | null;
  allRoutes?: FeatureCollection[];
  startPoint: [number, number] | null;
  endPoint: [number, number] | null;
  obstacles?: { id: string; name: string; lat: number; lng: number }[];
}

const stairsIcon = new Icon({
  iconUrl: "/stairs-14-svgrepo-com.svg",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const MapComponent = ({
  geoJsonData,
  allRoutes = [],
  startPoint,
  endPoint,
  obstacles = [],
}: MapComponentProps) => {
  const position: LatLngExpression = [51.589, -3.327]; // Centered on Trefforest campus

  if (!geoJsonData) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-600 dark:text-gray-300">Loading Map...</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={position}
      zoom={16}
      scrollWheelZoom={true}
      className="h-96 w-full rounded-lg shadow-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <GeoJSON
        data={geoJsonData}
        pointToLayer={(feature, latlng) => {
          return L.marker(latlng, { icon: defaultIcon });
        }}
        onEachFeature={(feature, layer) => {
          if (feature.properties && feature.properties.name) {
            layer.bindPopup(feature.properties.name);
          }
        }}
      />
      {/* Render all routes: first (shortest) in blue, others in gray */}
      {allRoutes.map((route, idx) => (
        <GeoJSON
          key={idx}
          data={route}
          style={() =>
            idx === 0
              ? { color: "blue", weight: 5, opacity: 0.7 }
              : { color: "gray", weight: 5, opacity: 0.3 }
          }
        />
      ))}
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
        <Marker key={obs.id} position={[obs.lat, obs.lng]} icon={stairsIcon}>
          <Popup>{obs.name}</Popup>
        </Marker>
      ))}
      <Marker position={position} icon={defaultIcon}>
        <Popup>University of South Wales, Trefforest Campus</Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapComponent;
