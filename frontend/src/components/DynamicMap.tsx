import dynamic from "next/dynamic";
import { FeatureCollection } from "geojson";

const MapComponent = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-gray-600 text-sm">Loading Map...</p>
      </div>
    </div>
  ),
});

interface DynamicMapProps {
  geoJsonData: FeatureCollection | null;
  allRoutes?: FeatureCollection[];
  startPoint: [number, number] | null;
  endPoint: [number, number] | null;
  obstacles?: Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
    restricted_for: string[];
  }>;
  currentMode?: string;
}

const DynamicMap = ({
  geoJsonData,
  allRoutes = [],
  startPoint,
  endPoint,
  obstacles = [],
  currentMode = "walk",
}: DynamicMapProps) => {
  return (
    <MapComponent
      geoJsonData={geoJsonData}
      allRoutes={allRoutes}
      startPoint={startPoint}
      endPoint={endPoint}
      obstacles={obstacles}
      currentMode={currentMode}
    />
  );
};

export default DynamicMap;
