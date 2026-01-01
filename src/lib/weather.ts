import { Weather, RouteStep } from "./types";

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

interface OpenMeteoResponse {
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    precipitation_probability: number[];
    snowfall: number[];
  };
}

/**
 * Fetch weather for a single coordinate at a specific time
 */
async function fetchWeatherForLocation(
  lat: number,
  lng: number,
  targetTime: Date
): Promise<Weather | null> {
  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lng.toString(),
      hourly: "temperature_2m,weather_code,precipitation_probability,snowfall",
      forecast_days: "16",
      timezone: "auto",
    });

    const response = await fetch(`${OPEN_METEO_URL}?${params}`);

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data: OpenMeteoResponse = await response.json();

    // Find the closest hour to our target time
    const targetHour = new Date(targetTime);
    targetHour.setMinutes(0, 0, 0);

    const hourIndex = data.hourly.time.findIndex((time) => {
      const forecastTime = new Date(time);
      return forecastTime >= targetHour;
    });

    if (hourIndex === -1) {
      // Target time is beyond forecast range
      return null;
    }

    return {
      temperature: data.hourly.temperature_2m[hourIndex],
      weatherCode: data.hourly.weather_code[hourIndex],
      precipitationProbability: data.hourly.precipitation_probability[hourIndex],
      isSnow: data.hourly.snowfall[hourIndex] > 0,
    };
  } catch (error) {
    console.error("Error fetching weather:", error);
    return null;
  }
}

/**
 * Fetch weather for all route steps
 */
export async function fetchWeatherForRoute(
  steps: RouteStep[],
  startTime: Date
): Promise<RouteStep[]> {
  const stepsWithWeather = await Promise.all(
    steps.map(async (step) => {
      const arrivalTime = new Date(
        startTime.getTime() + step.timeOffset * 60 * 60 * 1000
      );

      const weather = await fetchWeatherForLocation(
        step.city.coordinates.lat,
        step.city.coordinates.lng,
        arrivalTime
      );

      return {
        ...step,
        arrivalTime,
        weather: weather || undefined,
      };
    })
  );

  return stepsWithWeather;
}

/**
 * WMO Weather Code mappings
 * https://open-meteo.com/en/docs#weathervariables
 */
export type WeatherCondition =
  | "clear"
  | "partly-cloudy"
  | "cloudy"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "thunderstorm";

export function getWeatherCondition(code: number): WeatherCondition {
  if (code === 0) return "clear";
  if (code === 1 || code === 2) return "partly-cloudy";
  if (code === 3) return "cloudy";
  if (code >= 45 && code <= 48) return "fog";
  if (code >= 51 && code <= 55) return "drizzle";
  if (code >= 56 && code <= 67) return "rain";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 80 && code <= 82) return "rain";
  if (code >= 85 && code <= 86) return "snow";
  if (code >= 95 && code <= 99) return "thunderstorm";
  return "cloudy"; // default fallback
}

export function getWeatherDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };

  return descriptions[code] || "Unknown";
}

/**
 * Convert Celsius to Fahrenheit
 */
export function celsiusToFahrenheit(celsius: number): number {
  return Math.round((celsius * 9) / 5 + 32);
}

/**
 * Format temperature with unit
 */
export function formatTemperature(
  celsius: number,
  unit: "celsius" | "fahrenheit"
): string {
  if (unit === "fahrenheit") {
    return `${celsiusToFahrenheit(celsius)}°F`;
  }
  return `${Math.round(celsius)}°C`;
}
