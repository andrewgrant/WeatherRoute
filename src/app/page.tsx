"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { MapPin, AlertCircle } from "lucide-react";
import { RouteForm, RouteSteps, TemperatureToggle, TimeSlider, AddWaypointButton } from "@/components";
import { City, RouteStep } from "@/lib/types";
import { calculateRouteSteps, calculateDrivingTime } from "@/lib/routing";
import { fetchWeatherForRoute } from "@/lib/weather";
import { useTemperatureUnit } from "@/lib/useTemperatureUnit";

interface RouteData {
  origin: City;
  destination: City;
  timeStepHours: number;
}

/**
 * Get default departure time: 9am tomorrow
 */
function getDefaultDepartureTime(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  return tomorrow;
}

export default function Home() {
  const [routeSteps, setRouteSteps] = useState<RouteStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [baseTime, setBaseTime] = useState<Date>(getDefaultDepartureTime);
  const [timeOffset, setTimeOffset] = useState(0);
  const [originCity, setOriginCity] = useState<City | null>(null);
  const { unit: temperatureUnit, setUnit: setTemperatureUnit, isLoaded } = useTemperatureUnit();

  // For debouncing weather updates
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchedOffset = useRef<number | null>(null);

  const handleRouteSubmit = async (data: RouteData) => {
    setIsLoading(true);
    setError(null);
    setRouteSteps([]);
    setTimeOffset(0); // Reset offset on new route
    setOriginCity(data.origin); // Save origin for manual waypoints

    try {
      // Calculate route steps
      const steps = await calculateRouteSteps(
        data.origin,
        data.destination,
        data.timeStepHours
      );
      setRouteSteps(steps);
      setIsLoading(false);

      // Fetch weather for all steps
      setIsLoadingWeather(true);
      const stepsWithWeather = await fetchWeatherForRoute(steps, baseTime);
      setRouteSteps(stepsWithWeather);
      lastFetchedOffset.current = 0;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to calculate route"
      );
    } finally {
      setIsLoading(false);
      setIsLoadingWeather(false);
    }
  };

  // Fetch weather with debouncing for slider changes
  const fetchWeatherDebounced = useCallback(
    (newStartTime: Date, newOffset: number) => {
      // Clear any pending request
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Don't fetch if offset hasn't changed enough (avoid duplicate calls)
      if (lastFetchedOffset.current !== null &&
          Math.abs(newOffset - lastFetchedOffset.current) < 0.25) {
        return;
      }

      setIsLoadingWeather(true);

      debounceRef.current = setTimeout(async () => {
        try {
          const stepsWithWeather = await fetchWeatherForRoute(routeSteps, newStartTime);
          setRouteSteps(stepsWithWeather);
          lastFetchedOffset.current = newOffset;
        } catch (err) {
          console.error("Failed to update weather:", err);
        } finally {
          setIsLoadingWeather(false);
        }
      }, 150); // 150ms debounce for responsive feel
    },
    [routeSteps]
  );

  // Handle time offset changes from slider
  const handleTimeOffsetChange = useCallback(
    (newOffset: number) => {
      setTimeOffset(newOffset);

      if (routeSteps.length > 0) {
        const newStartTime = new Date(baseTime.getTime() + newOffset * 60 * 60 * 1000);
        fetchWeatherDebounced(newStartTime, newOffset);
      }
    },
    [baseTime, routeSteps.length, fetchWeatherDebounced]
  );

  // Handle base time changes from datetime picker
  const handleBaseTimeChange = async (newBaseTime: Date) => {
    setBaseTime(newBaseTime);
    setTimeOffset(0); // Reset offset when base time changes
    lastFetchedOffset.current = null;

    if (routeSteps.length > 0) {
      setIsLoadingWeather(true);
      try {
        const stepsWithWeather = await fetchWeatherForRoute(routeSteps, newBaseTime);
        setRouteSteps(stepsWithWeather);
        lastFetchedOffset.current = 0;
      } catch (err) {
        console.error("Failed to update weather:", err);
      } finally {
        setIsLoadingWeather(false);
      }
    }
  };

  // Handle adding a manual waypoint
  const handleAddWaypoint = async (city: City) => {
    if (!originCity) return;

    // Calculate driving time from origin to the new waypoint
    const drivingTime = await calculateDrivingTime(originCity, city);

    // Create the new step
    const newStep: RouteStep = {
      city,
      timeOffset: drivingTime,
      isManualWaypoint: true,
    };

    // Insert the new step at the correct position based on time offset
    const updatedSteps = [...routeSteps, newStep].sort(
      (a, b) => a.timeOffset - b.timeOffset
    );

    setRouteSteps(updatedSteps);

    // Fetch weather for the updated route
    setIsLoadingWeather(true);
    try {
      const startTime = new Date(baseTime.getTime() + timeOffset * 60 * 60 * 1000);
      const stepsWithWeather = await fetchWeatherForRoute(updatedSteps, startTime);
      setRouteSteps(stepsWithWeather);
    } catch (err) {
      console.error("Failed to fetch weather for new waypoint:", err);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
          <MapPin className="w-8 h-8 text-blue-500" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Plan Your Weather-Aware Journey
        </h2>
        <p className="text-gray-500 max-w-md mx-auto">
          Enter your starting point and destination to see weather forecasts at
          every stop along the way.
        </p>
      </div>

      {/* Route Planning Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <RouteForm onSubmit={handleRouteSubmit} isLoading={isLoading} />
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Route calculation failed</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Route Steps - shows while loading or after calculation */}
      {(isLoading || routeSteps.length > 0) && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          {/* Header with controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h3 className="font-medium text-gray-800">Your Route</h3>

            {routeSteps.length > 0 && isLoaded && (
              <div className="flex items-center gap-4">
                <TemperatureToggle
                  unit={temperatureUnit}
                  onChange={setTemperatureUnit}
                />
              </div>
            )}
          </div>

          {/* Time controls - sticky */}
          {routeSteps.length > 0 && (
            <div className="sticky top-0 z-10 -mx-6 px-6 py-4 mb-6 bg-white border-b border-gray-200 shadow-sm space-y-4">
              {/* Base time picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Departure Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formatDateTimeLocal(baseTime)}
                  onChange={(e) => handleBaseTimeChange(new Date(e.target.value))}
                  className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                />
              </div>

              {/* Time slider */}
              <TimeSlider
                baseTime={baseTime}
                offsetHours={timeOffset}
                onChange={handleTimeOffsetChange}
                disabled={isLoading}
              />
            </div>
          )}

          <RouteSteps
            steps={routeSteps}
            isLoading={isLoading}
            isLoadingWeather={isLoadingWeather}
            temperatureUnit={temperatureUnit}
            departureTime={new Date(baseTime.getTime() + timeOffset * 60 * 60 * 1000)}
          />

          {/* Add waypoint button */}
          {routeSteps.length > 0 && originCity && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <AddWaypointButton
                onAddWaypoint={handleAddWaypoint}
                disabled={isLoading || isLoadingWeather}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatDateTimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
