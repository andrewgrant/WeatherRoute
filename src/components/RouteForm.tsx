"use client";

import { useState, useEffect } from "react";
import { Navigation, Clock, AlertCircle } from "lucide-react";
import { CityAutocomplete } from "./CityAutocomplete";
import { City } from "@/lib/types";

interface RouteFormProps {
  onSubmit: (data: {
    origin: City;
    destination: City;
    timeStepMinutes: number;
  }) => void;
  isLoading?: boolean;
  initialOrigin?: City | null;
  initialDestination?: City | null;
  initialTimeStep?: number;
}

interface FormErrors {
  origin?: string;
  destination?: string;
  timeStep?: string;
}

export function RouteForm({
  onSubmit,
  isLoading = false,
  initialOrigin = null,
  initialDestination = null,
  initialTimeStep = 60,
}: RouteFormProps) {
  const [origin, setOrigin] = useState<City | null>(initialOrigin);
  const [destination, setDestination] = useState<City | null>(initialDestination);
  const [timeStepMinutes, setTimeStepMinutes] = useState<string>(initialTimeStep.toString());
  const [errors, setErrors] = useState<FormErrors>({});

  // Update state when initial values change (from URL)
  useEffect(() => {
    if (initialOrigin) setOrigin(initialOrigin);
  }, [initialOrigin]);

  useEffect(() => {
    if (initialDestination) setDestination(initialDestination);
  }, [initialDestination]);

  useEffect(() => {
    if (initialTimeStep !== 60) setTimeStepMinutes(initialTimeStep.toString());
  }, [initialTimeStep]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!origin) {
      newErrors.origin = "Please select a starting city";
    }

    if (!destination) {
      newErrors.destination = "Please select a destination city";
    }

    const timeStep = parseInt(timeStepMinutes, 10);
    if (isNaN(timeStep) || timeStep < 15 || timeStep > 480) {
      newErrors.timeStep = "Time step must be between 15 and 480 minutes";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    onSubmit({
      origin: origin!,
      destination: destination!,
      timeStepMinutes: parseInt(timeStepMinutes, 10),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        {/* Origin */}
        <div>
          <CityAutocomplete
            label="Starting City"
            placeholder="Where are you leaving from?"
            value={origin}
            onChange={(city) => {
              setOrigin(city);
              if (errors.origin) setErrors((e) => ({ ...e, origin: undefined }));
            }}
          />
          {errors.origin && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.origin}
            </p>
          )}
        </div>

        {/* Destination */}
        <div>
          <CityAutocomplete
            label="Destination"
            placeholder="Where are you going?"
            value={destination}
            onChange={(city) => {
              setDestination(city);
              if (errors.destination)
                setErrors((e) => ({ ...e, destination: undefined }));
            }}
          />
          {errors.destination && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.destination}
            </p>
          )}
        </div>
      </div>

      {/* Time Step */}
      <div className="sm:max-w-xs">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Time Step (minutes)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Clock className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="number"
            min="15"
            max="480"
            step="15"
            value={timeStepMinutes}
            onChange={(e) => {
              setTimeStepMinutes(e.target.value);
              if (errors.timeStep)
                setErrors((err) => ({ ...err, timeStep: undefined }));
            }}
            className="block w-full pl-10 pr-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          />
        </div>
        {errors.timeStep && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.timeStep}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Weather will be shown at each stop along the route
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Navigation className="h-4 w-4" />
        {isLoading ? "Planning Route..." : "Plan Route"}
      </button>
    </form>
  );
}
