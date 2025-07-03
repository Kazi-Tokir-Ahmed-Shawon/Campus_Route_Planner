import dynamic from "next/dynamic";
import { FeatureCollection } from "geojson";

const MapComponent = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <p className="text-gray-600 dark:text-gray-300">Loading Map...</p>
    </div>
  ),
});

interface DynamicMapProps {
  geoJsonData: FeatureCollection | null;
  routeGeoJson: FeatureCollection | null;
  startPoint: [number, number] | null;
  endPoint: [number, number] | null;
}

const DynamicMap = ({
  geoJsonData,
  routeGeoJson,
  startPoint,
  endPoint,
}: DynamicMapProps) => {
  return (
    <MapComponent
      geoJsonData={geoJsonData}
      routeGeoJson={routeGeoJson}
      startPoint={startPoint}
      endPoint={endPoint}
    />
  );
};

export default DynamicMap;
