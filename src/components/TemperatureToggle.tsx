"use client";

import { TemperatureUnit } from "@/lib/types";

interface TemperatureToggleProps {
  unit: TemperatureUnit;
  onChange: (unit: TemperatureUnit) => void;
}

export function TemperatureToggle({ unit, onChange }: TemperatureToggleProps) {
  return (
    <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white p-0.5">
      <button
        onClick={() => onChange("fahrenheit")}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          unit === "fahrenheit"
            ? "bg-blue-500 text-white"
            : "text-gray-600 hover:text-gray-800"
        }`}
      >
        °F
      </button>
      <button
        onClick={() => onChange("celsius")}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          unit === "celsius"
            ? "bg-blue-500 text-white"
            : "text-gray-600 hover:text-gray-800"
        }`}
      >
        °C
      </button>
    </div>
  );
}
