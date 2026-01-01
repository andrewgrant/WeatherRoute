"use client";

import { useState } from "react";
import { MapPin, AlertCircle } from "lucide-react";
import { RouteForm, RouteSteps, TemperatureToggle } from "@/components";
import { City, RouteStep } from "@/lib/types";
import { calculateRouteSteps } from "@/lib/routing";
import { fetchWeatherForRoute } from "@/lib/weather";
import { useTemperatureUnit } from "@/lib/useTemperatureUnit";

interface RouteData {
  origin: City;
  destination: City;
  timeStepHours: number;
}

export default function Home() {
  const [routeSteps, setRouteSteps] = useState<RouteStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const { unit: temperatureUnit, setUnit: setTemperatureUnit, isLoaded } = useTemperatureUnit();

  const handleRouteSubmit = async (data: RouteData) => {
    setIsLoading(true);
    setError(null);
    setRouteSteps([]);

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
      const stepsWithWeather = await fetchWeatherForRoute(steps, startTime);
      setRouteSteps(stepsWithWeather);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to calculate route"
      );
    } finally {
      setIsLoading(false);
      setIsLoadingWeather(false);
    }
  };

  // Refetch weather when start time changes (if we have steps)
  const handleStartTimeChange = async (newStartTime: Date) => {
    setStartTime(newStartTime);

    if (routeSteps.length > 0) {
      setIsLoadingWeather(true);
      try {
        const stepsWithWeather = await fetchWeatherForRoute(routeSteps, newStartTime);
        setRouteSteps(stepsWithWeather);
      } catch (err) {
        console.error("Failed to update weather:", err);
      } finally {
        setIsLoadingWeather(false);
      }
    }
  };

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

          {/* Start time selector */}
          {routeSteps.length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Departure Time
              </label>
              <input
                type="datetime-local"
                value={formatDateTimeLocal(startTime)}
                onChange={(e) => handleStartTimeChange(new Date(e.target.value))}
                className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              />
              <p className="mt-1 text-xs text-gray-500">
                Weather forecasts will update based on your departure time
              </p>
            </div>
          )}

          <RouteSteps
            steps={routeSteps}
            isLoading={isLoading}
            isLoadingWeather={isLoadingWeather}
            temperatureUnit={temperatureUnit}
          />
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
