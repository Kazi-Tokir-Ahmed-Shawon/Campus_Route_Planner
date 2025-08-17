"use client";

import { useState } from "react";

interface Location {
  id: string;
  name: string;
}

interface RouteControlProps {
  locations: Location[];
  onRouteFind: (start: string, end: string, mode: string) => void;
}

const RouteControl = ({ locations, onRouteFind }: RouteControlProps) => {
  const [startPoint, setStartPoint] = useState<string>("");
  const [endPoint, setEndPoint] = useState<string>("");
  const [selectedMode, setSelectedMode] = useState<string>("walk");

  const handleRouteFind = () => {
    if (startPoint && endPoint) {
      onRouteFind(startPoint, endPoint, selectedMode);
    } else {
      alert("Please select a start and end point.");
    }
  };

  const getModeDescription = (mode: string) => {
    switch (mode) {
      case "walk":
        return "Walking routes avoiding vehicle-only areas";
      case "cycle":
        return "Cycling routes avoiding stairs and narrow paths";
      case "disabled":
        return "Accessible routes avoiding stairs and uneven surfaces";
      default:
        return "Walking routes avoiding vehicle-only areas";
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div>
        <label className="block text-sm font-medium text-black mb-4">
          Travel Mode
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "walk", label: "🚶", desc: "Walk" },
            { value: "cycle", label: "🚴", desc: "Cycle" },
            { value: "disabled", label: "♿", desc: "Accessible" },
          ].map((mode) => (
            <button
              key={mode.value}
              onClick={() => setSelectedMode(mode.value)}
              className={`p-4 rounded-lg border transition-all ${
                selectedMode === mode.value
                  ? "border-black bg-black text-white"
                  : "border-gray-300 bg-white text-black hover:border-gray-400"
              }`}
            >
              <div className="text-xl">{mode.label}</div>
              <div className="text-sm font-medium">{mode.desc}</div>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          {getModeDescription(selectedMode)}
        </p>
      </div>

      {/* Location Selection */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-black mb-3">
            Start Point
          </label>
          <select
            value={startPoint}
            onChange={(e) => setStartPoint(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg bg-white text-black focus:border-black focus:outline-none text-base"
          >
            <option value="">Select start location</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-3">
            Destination
          </label>
          <select
            value={endPoint}
            onChange={(e) => setEndPoint(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg bg-white text-black focus:border-black focus:outline-none text-base"
          >
            <option value="">Select destination</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Find Route Button */}
      <button
        onClick={handleRouteFind}
        disabled={!startPoint || !endPoint}
        className="w-full p-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors text-base"
      >
        Find Route
      </button>
    </div>
  );
};

export default RouteControl;
