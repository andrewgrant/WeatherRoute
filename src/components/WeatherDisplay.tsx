"use client";

import {
  Sun,
  Cloud,
  CloudSun,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Droplets,
  Snowflake,
} from "lucide-react";
import { Weather, TemperatureUnit } from "@/lib/types";
import {
  getWeatherCondition,
  getWeatherDescription,
  formatTemperature,
  WeatherCondition,
} from "@/lib/weather";

interface WeatherDisplayProps {
  weather: Weather;
  unit: TemperatureUnit;
  compact?: boolean;
}

const weatherIcons: Record<WeatherCondition, React.ElementType> = {
  clear: Sun,
  "partly-cloudy": CloudSun,
  cloudy: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  snow: CloudSnow,
  thunderstorm: CloudLightning,
};

const weatherColors: Record<WeatherCondition, string> = {
  clear: "text-amber-400",
  "partly-cloudy": "text-amber-300",
  cloudy: "text-gray-400",
  fog: "text-gray-400",
  drizzle: "text-blue-300",
  rain: "text-blue-400",
  snow: "text-sky-200",
  thunderstorm: "text-gray-600",
};

export function WeatherDisplay({
  weather,
  unit,
  compact = false,
}: WeatherDisplayProps) {
  const condition = getWeatherCondition(weather.weatherCode);
  const description = getWeatherDescription(weather.weatherCode);
  const Icon = weatherIcons[condition];
  const iconColor = weatherColors[condition];

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Icon className={`h-5 w-5 ${iconColor}`} />
        <span className="font-medium text-gray-800">
          {formatTemperature(weather.temperature, unit)}
        </span>
        {weather.precipitationProbability > 0 && (
          <span className="flex items-center gap-0.5 text-xs text-blue-500">
            {weather.isSnow ? (
              <Snowflake className="h-3 w-3" />
            ) : (
              <Droplets className="h-3 w-3" />
            )}
            {weather.precipitationProbability}%
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 ${iconColor}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold text-gray-800">
            {formatTemperature(weather.temperature, unit)}
          </span>
          <span className="text-sm text-gray-500 truncate">{description}</span>
        </div>
        {weather.precipitationProbability > 0 && (
          <div className="flex items-center gap-1 text-sm text-blue-500">
            {weather.isSnow ? (
              <Snowflake className="h-3.5 w-3.5" />
            ) : (
              <Droplets className="h-3.5 w-3.5" />
            )}
            <span>
              {weather.precipitationProbability}% chance of{" "}
              {weather.isSnow ? "snow" : "precipitation"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

interface WeatherLoadingProps {
  compact?: boolean;
}

export function WeatherLoading({ compact = false }: WeatherLoadingProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <div className="h-5 w-5 bg-gray-200 rounded-full" />
        <div className="h-4 w-12 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 animate-pulse">
      <div className="w-10 h-10 bg-gray-200 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="h-5 w-20 bg-gray-200 rounded" />
        <div className="h-4 w-32 bg-gray-100 rounded" />
      </div>
    </div>
  );
}
