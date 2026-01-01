"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { RouteForm } from "@/components";
import { City } from "@/lib/types";

interface RouteData {
  origin: City;
  destination: City;
  timeStepHours: number;
}

export default function Home() {
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRouteSubmit = async (data: RouteData) => {
    setIsLoading(true);
    // For now, just store the data - route calculation comes in Phase 3
    setRouteData(data);
    setIsLoading(false);
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

      {/* Route Preview - shows after form submission */}
      {routeData && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="font-medium text-gray-800 mb-4">Route Preview</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-700">Start</p>
                <p className="text-gray-500">{routeData.origin.fullName}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-700">Destination</p>
                <p className="text-gray-500">{routeData.destination.fullName}</p>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <p className="text-gray-500">
                Weather updates every{" "}
                <span className="font-medium text-gray-700">
                  {routeData.timeStepHours} hour
                  {routeData.timeStepHours !== 1 ? "s" : ""}
                </span>
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-400">
            Route calculation with waypoints coming in Phase 3
          </p>
        </div>
      )}
    </div>
  );
}
