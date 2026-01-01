"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { City } from "@/lib/types";
import { CityAutocomplete } from "./CityAutocomplete";

interface AddWaypointButtonProps {
  onAddWaypoint: (city: City) => Promise<void>;
  disabled?: boolean;
}

export function AddWaypointButton({
  onAddWaypoint,
  disabled = false,
}: AddWaypointButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  const handleCityChange = async (city: City | null) => {
    if (city) {
      setSelectedCity(city);
      setIsAdding(true);
      try {
        await onAddWaypoint(city);
        setIsExpanded(false);
        setSelectedCity(null);
      } catch (error) {
        console.error("Failed to add waypoint:", error);
      } finally {
        setIsAdding(false);
      }
    } else {
      setSelectedCity(null);
    }
  };

  const handleCancel = () => {
    setIsExpanded(false);
    setSelectedCity(null);
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        disabled={disabled}
        className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="h-4 w-4" />
        <span>Add a stop</span>
      </button>
    );
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Add a custom stop
        </span>
        <button
          onClick={handleCancel}
          className="p-1 text-gray-400 hover:text-gray-600 rounded"
          aria-label="Cancel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <CityAutocomplete
        label=""
        placeholder="Search for a city..."
        value={selectedCity}
        onChange={handleCityChange}
      />

      <div className="flex items-center gap-2 text-xs text-gray-500">
        {isAdding ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Calculating driving time...</span>
          </>
        ) : (
          <span>
            The stop will be inserted at the correct position based on driving time from your origin.
          </span>
        )}
      </div>
    </div>
  );
}
