"use client";

interface RouteDetailsProps {
  distance: number;
  directions: string[];
}

const RouteDetails = ({ distance, directions }: RouteDetailsProps) => {
  // Average walking speed: 1.4 meters per second
  const walkingSpeed = 1.4;
  const walkingTimeMinutes = Math.ceil(distance / walkingSpeed / 60);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        Route Details
      </h2>

      {/* Stats */}
      <div className="flex items-center gap-6 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Distance</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {distance.toFixed(0)} meters
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Est. Time</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {walkingTimeMinutes} min
          </p>
        </div>
      </div>

      {/* Directions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Directions
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
          {directions.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default RouteDetails;
