import { Weather, RouteStep } from "./types";

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

interface OpenMeteoResponse {
  elevation: number;
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    precipitation_probability: number[];
    rain: number[];
    snowfall: number[];
    wind_speed_10m: number[];
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
      hourly: "temperature_2m,weather_code,precipitation_probability,rain,snowfall,wind_speed_10m",
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

    const precipProb = data.hourly.precipitation_probability[hourIndex];
    const rain = data.hourly.rain[hourIndex];
    const snowfall = data.hourly.snowfall[hourIndex];
    const temp = data.hourly.temperature_2m[hourIndex];

    // Calculate rain vs snow probability based on precipitation type
    // If there's snowfall, attribute probability to snow; otherwise to rain
    let rainProbability = 0;
    let snowProbability = 0;

    if (precipProb > 0) {
      if (snowfall > 0 && rain === 0) {
        // Only snow
        snowProbability = precipProb;
      } else if (rain > 0 && snowfall === 0) {
        // Only rain
        rainProbability = precipProb;
      } else if (snowfall > 0 && rain > 0) {
        // Mixed - split based on amounts
        const total = rain + snowfall;
        rainProbability = Math.round((rain / total) * precipProb);
        snowProbability = Math.round((snowfall / total) * precipProb);
      } else {
        // No precipitation amounts yet, use temperature to guess
        if (temp <= 2) {
          snowProbability = precipProb;
        } else {
          rainProbability = precipProb;
        }
      }
    }

    return {
      temperature: temp,
      weatherCode: data.hourly.weather_code[hourIndex],
      rainProbability,
      snowProbability,
      windSpeed: data.hourly.wind_speed_10m[hourIndex],
      elevation: data.elevation,
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

/**
 * Convert km/h to mph
 */
export function kmhToMph(kmh: number): number {
  return Math.round(kmh * 0.621371);
}

/**
 * Format wind speed with unit
 */
export function formatWindSpeed(
  kmh: number,
  unit: "celsius" | "fahrenheit"
): string {
  // Use mph for Fahrenheit users, km/h for Celsius users
  if (unit === "fahrenheit") {
    return `${kmhToMph(kmh)} mph`;
  }
  return `${Math.round(kmh)} km/h`;
}

/**
 * Convert meters to feet
 */
export function metersToFeet(meters: number): number {
  return Math.round(meters * 3.28084);
}

/**
 * Format elevation with unit
 */
export function formatElevation(
  meters: number,
  unit: "celsius" | "fahrenheit"
): string {
  // Use feet for Fahrenheit users, meters for Celsius users
  if (unit === "fahrenheit") {
    return `${metersToFeet(meters).toLocaleString()} ft`;
  }
  return `${Math.round(meters).toLocaleString()} m`;
}
