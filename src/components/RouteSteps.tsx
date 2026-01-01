"use client";

import { MapPin, Navigation, Clock } from "lucide-react";
import { RouteStep, TemperatureUnit } from "@/lib/types";
import { formatTimeOffset } from "@/lib/routing";
import { WeatherDisplay, WeatherLoading } from "./WeatherDisplay";

interface RouteStepsProps {
  steps: RouteStep[];
  isLoading?: boolean;
  isLoadingWeather?: boolean;
  temperatureUnit: TemperatureUnit;
}

export function RouteSteps({
  steps,
  isLoading = false,
  isLoadingWeather = false,
  temperatureUnit,
}: RouteStepsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-500">
          <div className="animate-spin">
            <Navigation className="h-4 w-4" />
          </div>
          <span className="text-sm">Calculating route...</span>
        </div>
        {/* Loading skeleton */}
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
              <div className="h-4 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (steps.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      {steps.map((step, index) => {
        const isFirst = index === 0;
        const isLast = index === steps.length - 1;

        return (
          <div key={`${step.city.name}-${step.timeOffset}`} className="relative">
            {/* Connector line */}
            {!isLast && (
              <div className="absolute left-5 top-10 w-0.5 h-full bg-gray-200 -translate-x-1/2" />
            )}

            <div className="flex items-start gap-4 py-3">
              {/* Icon */}
              <div
                className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 ${
                  isFirst
                    ? "bg-green-100 text-green-600"
                    : isLast
                    ? "bg-red-100 text-red-600"
                    : "bg-blue-50 text-blue-500"
                }`}
              >
                {isFirst || isLast ? (
                  <MapPin className="h-5 w-5" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
              </div>

              {/* City info and weather */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {step.city.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {step.city.fullName}
                    </p>
                    {step.arrivalTime && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatArrivalTime(step.arrivalTime)}
                      </p>
                    )}
                  </div>

                  {/* Time offset */}
                  <div className="flex-shrink-0 text-right">
                    <span
                      className={`text-sm font-medium ${
                        isFirst
                          ? "text-green-600"
                          : isLast
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {formatTimeOffset(step.timeOffset)}
                    </span>
                  </div>
                </div>

                {/* Weather */}
                <div className="mt-2">
                  {isLoadingWeather ? (
                    <WeatherLoading compact />
                  ) : step.weather ? (
                    <WeatherDisplay
                      weather={step.weather}
                      unit={temperatureUnit}
                      compact
                    />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Summary */}
      {steps.length > 0 && (
        <div className="pt-4 mt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Total journey time</span>
            <span className="font-medium text-gray-700">
              {formatTotalTime(steps[steps.length - 1].timeOffset)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-500">Weather stops</span>
            <span className="font-medium text-gray-700">{steps.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function formatTotalTime(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);

  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

function formatArrivalTime(date: Date): string {
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
