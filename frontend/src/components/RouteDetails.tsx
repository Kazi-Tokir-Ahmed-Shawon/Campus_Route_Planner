"use client";

interface RouteDetailsProps {
  distance: number;
  directions: string[];
  mode?: string;
  time?: number;
  timeDisplay?: string;
  modeInfo?: {
    walk: boolean;
    cycle: boolean;
    disabled: boolean;
  };
  hasStairs?: boolean;
  obstacles?: Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
    restricted_for: string[];
  }>;
}

const RouteDetails = ({
  distance,
  directions,
  mode = "walk",
  timeDisplay,
  modeInfo,
  hasStairs = false,
  obstacles = [],
}: RouteDetailsProps) => {
  // Use backend time if available, otherwise fall back to frontend calculation
  const getTimeDisplay = () => {
    if (timeDisplay) {
      return timeDisplay;
    }

    // Fallback calculation (should not be used with new backend)
    const getSpeedAndTime = () => {
      switch (mode) {
        case "cycle":
          return { speed: 4.0, unit: "cycling" }; // 4 m/s cycling
        case "walk":
        case "disabled":
        default:
          return { speed: 1.4, unit: "walking" }; // 1.4 m/s walking
      }
    };

    const { speed } = getSpeedAndTime();
    const estimatedTimeMinutes = Math.ceil(distance / speed / 60);
    return `~${estimatedTimeMinutes} min`;
  };

  const getModeDisplayName = (mode: string) => {
    switch (mode) {
      case "walk":
        return "Pedestrian";
      case "cycle":
        return "Cycling";
      case "disabled":
        return "Accessibility";
      default:
        return "Pedestrian";
    }
  };

  const getModeWarning = (mode: string, hasStairs: boolean) => {
    if (mode === "cycle" && hasStairs) {
      return "⚠️ This route includes stairs. Cycling may not be suitable for this path.";
    }
    if (mode === "disabled" && hasStairs) {
      return "⚠️ This route includes stairs. Alternative accessible routes may be available.";
    }
    return null;
  };

  const getObstaclesForMode = () => {
    return obstacles.filter((obs) => obs.restricted_for.includes(mode));
  };

  const relevantObstacles = getObstaclesForMode();
  const warning = getModeWarning(mode, hasStairs);
  const timeDisplayValue = getTimeDisplay();

  return (
    <div className="space-y-6">
      {/* Mode and Warning */}
      <div className="pb-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
              Mode
            </p>
            <p className="text-xl font-semibold text-black">
              {getModeDisplayName(mode)}
            </p>
            {/* Show mode-specific info if available */}
            {modeInfo && (
              <div className="flex gap-2 mt-2">
                {modeInfo.walk && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Walking Route
                  </span>
                )}
                {modeInfo.cycle && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Cycling Route
                  </span>
                )}
                {modeInfo.disabled && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    Accessible Route
                  </span>
                )}
              </div>
            )}
          </div>
          {warning && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-xs">
              <p className="text-sm text-yellow-800">{warning}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-6 pb-6 border-b border-gray-200">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            Distance
          </p>
          <p className="text-xl font-semibold text-black">
            {distance.toFixed(0)}m
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            Time
          </p>
          <p className="text-xl font-semibold text-black">{timeDisplayValue}</p>
          {/* Show if this is backend-calculated time */}
          {timeDisplay && (
            <p className="text-xs text-gray-500 mt-1">Real-time calculation</p>
          )}
        </div>
      </div>

      {/* Directions */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-4">
          Directions
        </p>
        <div className="space-y-3 max-h-48 overflow-y-auto pr-2 content-scroll">
          {directions.map((direction, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-7 h-7 bg-black text-white rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
              <p className="text-sm text-black leading-relaxed">{direction}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Obstacles */}
      {relevantObstacles.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-4">
            Route Obstacles
          </p>
          <div className="space-y-3 max-h-32 overflow-y-auto pr-2 ">
            {relevantObstacles.map((obstacle) => (
              <div
                key={obstacle.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-black">{obstacle.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteDetails;
