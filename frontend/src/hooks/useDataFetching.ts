import { useEffect, useCallback } from "react";
import { useStore } from "@/store/useStore";
import { ApiService } from "@/services/api";

export const useDataFetching = () => {
  const {
    setLocations,
    setObstacles,
    setLoading,
    setError,
    setBackendStatus,
    clearErrors,
    backendStatus,
  } = useStore();

  // Fetch all data (locations and obstacles)
  const fetchAllData = useCallback(async () => {
    try {
      clearErrors();

      // Check backend health first with timeout
      const healthCheckPromise = ApiService.checkHealth();
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Health check timeout")), 5001)
      );

      const healthCheck = await Promise.race([
        healthCheckPromise,
        timeoutPromise,
      ]);

      if (healthCheck.status === "OK") {
        setBackendStatus("connected");
      } else if (healthCheck.status === "Fallback") {
        setBackendStatus("fallback");
      } else {
        setBackendStatus("disconnected");
      }

      // Fetch locations and obstacles in parallel with timeout
      const dataPromise = Promise.all([
        ApiService.getLocations(),
        ApiService.getObstacles(),
      ]);

      const [locations, obstacles] = await Promise.race([
        dataPromise,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Data fetch timeout")), 10000)
        ),
      ]);

      setLocations(locations);
      setObstacles(obstacles);
    } catch (error) {
      console.error("Error fetching data:", error);
      setBackendStatus("disconnected");
      setError("locations", "Failed to fetch locations");
      setError("obstacles", "Failed to fetch obstacles");
    }
  }, [setLocations, setObstacles, setError, setBackendStatus, clearErrors]);

  // Fetch only locations
  const fetchLocations = useCallback(
    async (type?: "all-campus" | "tree-house-campus") => {
      try {
        setLoading("locations", true);
        setError("locations", null);

        const locations = await ApiService.getLocations(type);
        setLocations(locations);
      } catch (error) {
        console.error("Error fetching locations:", error);
        setError("locations", "Failed to fetch locations");
      } finally {
        setLoading("locations", false);
      }
    },
    [setLocations, setLoading, setError]
  );

  // Fetch only obstacles
  const fetchObstacles = useCallback(async () => {
    try {
      setLoading("obstacles", true);
      setError("obstacles", null);

      const obstacles = await ApiService.getObstacles();
      setObstacles(obstacles);
    } catch (error) {
      console.error("Error fetching obstacles:", error);
      setError("obstacles", "Failed to fetch obstacles");
    } finally {
      setLoading("obstacles", false);
    }
  }, [setObstacles, setLoading, setError]);

  // Refresh data (useful after CRUD operations)
  const refreshData = useCallback(async () => {
    await fetchAllData();
  }, [fetchAllData]);

  // Initial data fetch
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Periodic health check to detect when backend becomes available
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const healthCheck = await ApiService.checkHealth();
        if (healthCheck.status === "OK" && backendStatus !== "connected") {
          setBackendStatus("connected");
          // Refresh data from backend if it just became available
          fetchAllData();
        } else if (
          healthCheck.status === "Fallback" &&
          backendStatus === "disconnected"
        ) {
          setBackendStatus("fallback");
        }
      } catch (error) {
        console.warn("Periodic health check failed:", error);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [fetchAllData, backendStatus, setBackendStatus]);

  return {
    fetchAllData,
    fetchLocations,
    fetchObstacles,
    refreshData,
  };
};
