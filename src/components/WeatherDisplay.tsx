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
  Wind,
  Mountain,
  Umbrella,
} from "lucide-react";
import { Weather, TemperatureUnit } from "@/lib/types";
import {
  getWeatherCondition,
  getWeatherDescription,
  formatTemperature,
  formatWindSpeed,
  formatElevation,
  formatRain,
  formatSnow,
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
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {/* Temperature and condition */}
          <div className="flex items-center gap-1.5">
            <Icon className={`h-5 w-5 ${iconColor}`} />
            <span className="font-medium text-gray-800">
              {formatTemperature(weather.temperature, unit)}
            </span>
          </div>

          {/* Rain probability */}
          <span className="flex items-center gap-0.5 text-xs text-blue-500">
            <Droplets className="h-3 w-3" />
            {weather.rainProbability}%
          </span>

          {/* Snow probability */}
          <span className="flex items-center gap-0.5 text-xs text-sky-400">
            <Snowflake className="h-3 w-3" />
            {weather.snowProbability}%
          </span>

          {/* Wind speed */}
          <span className="flex items-center gap-0.5 text-xs text-gray-500">
            <Wind className="h-3 w-3" />
            {formatWindSpeed(weather.windSpeed, unit)}
          </span>

          {/* Elevation */}
          <span className="flex items-center gap-0.5 text-xs text-gray-400">
            <Mountain className="h-3 w-3" />
            {formatElevation(weather.elevation, unit)}
          </span>
        </div>

        {/* Earlier predictions */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
          <span className="text-gray-400">Earlier:</span>
          <span>
            -4h:{" "}
            <span className="text-gray-700">{formatTemperature(weather.temperature4hEarlier, unit)}</span>
            {" "}
            <span className="text-blue-500">{weather.rainProbability4hEarlier}%</span>
            {" / "}
            <span className="text-sky-400">{weather.snowProbability4hEarlier}%</span>
          </span>
          <span>
            -8h:{" "}
            <span className="text-gray-700">{formatTemperature(weather.temperature8hEarlier, unit)}</span>
            {" "}
            <span className="text-blue-500">{weather.rainProbability8hEarlier}%</span>
            {" / "}
            <span className="text-sky-400">{weather.snowProbability8hEarlier}%</span>
          </span>
          <span>
            -12h:{" "}
            <span className="text-gray-700">{formatTemperature(weather.temperature12hEarlier, unit)}</span>
            {" "}
            <span className="text-blue-500">{weather.rainProbability12hEarlier}%</span>
            {" / "}
            <span className="text-sky-400">{weather.snowProbability12hEarlier}%</span>
          </span>
        </div>

        {/* Later predictions */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
          <span className="text-gray-400">Later:</span>
          <span>
            +4h:{" "}
            <span className="text-gray-700">{formatTemperature(weather.temperature4hLater, unit)}</span>
            {" "}
            <span className="text-blue-500">{weather.rainProbability4hLater}%</span>
            {" / "}
            <span className="text-sky-400">{weather.snowProbability4hLater}%</span>
          </span>
          <span>
            +8h:{" "}
            <span className="text-gray-700">{formatTemperature(weather.temperature8hLater, unit)}</span>
            {" "}
            <span className="text-blue-500">{weather.rainProbability8hLater}%</span>
            {" / "}
            <span className="text-sky-400">{weather.snowProbability8hLater}%</span>
          </span>
          <span>
            +12h:{" "}
            <span className="text-gray-700">{formatTemperature(weather.temperature12hLater, unit)}</span>
            {" "}
            <span className="text-blue-500">{weather.rainProbability12hLater}%</span>
            {" / "}
            <span className="text-sky-400">{weather.snowProbability12hLater}%</span>
          </span>
        </div>

        {/* Accumulated precipitation */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
          <span className="flex items-center gap-1 text-gray-400">
            <Umbrella className="h-3 w-3" />
            Accumulation:
          </span>
          <span>
            1h:{" "}
            <span className="text-blue-500">{formatRain(weather.accumulatedRain1h, unit)}</span>
            {" / "}
            <span className="text-sky-400">{formatSnow(weather.accumulatedSnow1h, unit)}</span>
          </span>
          <span>
            2h:{" "}
            <span className="text-blue-500">{formatRain(weather.accumulatedRain2h, unit)}</span>
            {" / "}
            <span className="text-sky-400">{formatSnow(weather.accumulatedSnow2h, unit)}</span>
          </span>
          <span>
            4h:{" "}
            <span className="text-blue-500">{formatRain(weather.accumulatedRain4h, unit)}</span>
            {" / "}
            <span className="text-sky-400">{formatSnow(weather.accumulatedSnow4h, unit)}</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
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

        {/* Weather details grid */}
        <div className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          {/* Rain */}
          <div className="flex items-center gap-1.5 text-blue-500">
            <Droplets className="h-3.5 w-3.5" />
            <span>Rain: {weather.rainProbability}%</span>
          </div>

          {/* Snow */}
          <div className="flex items-center gap-1.5 text-sky-400">
            <Snowflake className="h-3.5 w-3.5" />
            <span>Snow: {weather.snowProbability}%</span>
          </div>

          {/* Wind */}
          <div className="flex items-center gap-1.5 text-gray-500">
            <Wind className="h-3.5 w-3.5" />
            <span>{formatWindSpeed(weather.windSpeed, unit)}</span>
          </div>

          {/* Elevation */}
          <div className="flex items-center gap-1.5 text-gray-400">
            <Mountain className="h-3.5 w-3.5" />
            <span>{formatElevation(weather.elevation, unit)}</span>
          </div>
        </div>

        {/* Accumulated precipitation section */}
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1 mb-1">
            <Umbrella className="h-3 w-3 text-gray-400" />
            <span className="text-xs font-medium text-gray-500">
              Accumulation
            </span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
            <div>
              <span className="text-gray-400">1h:</span>{" "}
              <span className="text-blue-500">{formatRain(weather.accumulatedRain1h, unit)}</span>
              {" / "}
              <span className="text-sky-400">{formatSnow(weather.accumulatedSnow1h, unit)}</span>
            </div>
            <div>
              <span className="text-gray-400">2h:</span>{" "}
              <span className="text-blue-500">{formatRain(weather.accumulatedRain2h, unit)}</span>
              {" / "}
              <span className="text-sky-400">{formatSnow(weather.accumulatedSnow2h, unit)}</span>
            </div>
            <div>
              <span className="text-gray-400">4h:</span>{" "}
              <span className="text-blue-500">{formatRain(weather.accumulatedRain4h, unit)}</span>
              {" / "}
              <span className="text-sky-400">{formatSnow(weather.accumulatedSnow4h, unit)}</span>
            </div>
          </div>
        </div>
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
      <div className="flex items-center gap-3 animate-pulse">
        <div className="h-5 w-5 bg-gray-200 rounded-full" />
        <div className="h-4 w-12 bg-gray-200 rounded" />
        <div className="h-3 w-8 bg-gray-100 rounded" />
        <div className="h-3 w-8 bg-gray-100 rounded" />
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
