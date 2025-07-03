"use client";

import { useState } from "react";

interface Location {
  id: string;
  name: string;
}

interface RouteControlProps {
  locations: Location[];
  onRouteFind: (start: string, end: string) => void;
}

const RouteControl = ({ locations, onRouteFind }: RouteControlProps) => {
  const [startPoint, setStartPoint] = useState<string>("");
  const [endPoint, setEndPoint] = useState<string>("");

  const handleRouteFind = () => {
    if (startPoint && endPoint) {
      onRouteFind(startPoint, endPoint);
    } else {
      alert("Please select a start and end point.");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        Find a Route
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        {/* Start Point Dropdown */}
        <div className="flex-grow">
          <label
            htmlFor="start-point"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Start
          </label>
          <select
            id="start-point"
            value={startPoint}
            onChange={(e) => setStartPoint(e.target.value)}
            className="w-full h-10 px-3 text-base placeholder-gray-600 border rounded-lg focus:shadow-outline dark:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            <option value="" disabled>
              Select a starting point
            </option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        {/* End Point Dropdown */}
        <div className="flex-grow">
          <label
            htmlFor="end-point"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Destination
          </label>
          <select
            id="end-point"
            value={endPoint}
            onChange={(e) => setEndPoint(e.target.value)}
            className="w-full h-10 px-3 text-base placeholder-gray-600 border rounded-lg focus:shadow-outline dark:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            <option value="" disabled>
              Select a destination
            </option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        {/* Find Route Button */}
        <button
          onClick={handleRouteFind}
          className="w-full h-10 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          disabled={!startPoint || !endPoint}
        >
          Find Route
        </button>
      </div>
    </div>
  );
};

export default RouteControl;
