"use client";

import { useState } from "react";
import { MapPin, AlertCircle } from "lucide-react";
import { RouteForm, RouteSteps } from "@/components";
import { City, RouteStep } from "@/lib/types";
import { calculateRouteSteps } from "@/lib/routing";

interface RouteData {
  origin: City;
  destination: City;
  timeStepHours: number;
}

export default function Home() {
  const [routeSteps, setRouteSteps] = useState<RouteStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRouteSubmit = async (data: RouteData) => {
    setIsLoading(true);
    setError(null);
    setRouteSteps([]);

    try {
      const steps = await calculateRouteSteps(
        data.origin,
        data.destination,
        data.timeStepHours
      );
      setRouteSteps(steps);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to calculate route"
      );
    } finally {
      setIsLoading(false);
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
          <h3 className="font-medium text-gray-800 mb-4">Your Route</h3>
          <RouteSteps steps={routeSteps} isLoading={isLoading} />
          {routeSteps.length > 0 && (
            <p className="mt-4 text-xs text-gray-400">
              Weather forecasts will be added in Phase 4
            </p>
          )}
        </div>
      )}
    </div>
  );
}
