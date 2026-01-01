import { Weather, RouteStep } from "./types";
import { fetchAlertsForLocation } from "./alerts";

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

/**
 * Sum precipitation values for a window of hours before the target index
 * @param values Array of hourly precipitation values
 * @param endIndex The index of the arrival hour
 * @param windowHours Number of hours to look back
 * @returns Total precipitation in the window
 */
function sumPrecipitation(
  values: number[],
  endIndex: number,
  windowHours: number
): number {
  const startIndex = Math.max(0, endIndex - windowHours);
  let total = 0;
  for (let i = startIndex; i < endIndex; i++) {
    total += values[i] || 0;
  }
  // Round to 1 decimal place
  return Math.round(total * 10) / 10;
}

/**
 * Get precipitation probability at an earlier hour
 * @param precipProbs Array of hourly precipitation probabilities
 * @param rain Array of hourly rain amounts
 * @param snowfall Array of hourly snowfall amounts
 * @param temps Array of hourly temperatures
 * @param hourIndex Current hour index
 * @param hoursBack How many hours to look back
 * @returns Object with rain and snow probability
 */
function getEarlierPrecipProb(
  precipProbs: number[],
  rain: number[],
  snowfall: number[],
  temps: number[],
  hourIndex: number,
  hoursBack: number
): { rainProb: number; snowProb: number } {
  const earlierIndex = hourIndex - hoursBack;
  if (earlierIndex < 0) {
    return { rainProb: 0, snowProb: 0 };
  }

  const precipProb = precipProbs[earlierIndex] || 0;
  const rainAmt = rain[earlierIndex] || 0;
  const snowAmt = snowfall[earlierIndex] || 0;
  const temp = temps[earlierIndex] || 0;

  let rainProb = 0;
  let snowProb = 0;

  if (precipProb > 0) {
    if (snowAmt > 0 && rainAmt === 0) {
      snowProb = precipProb;
    } else if (rainAmt > 0 && snowAmt === 0) {
      rainProb = precipProb;
    } else if (snowAmt > 0 && rainAmt > 0) {
      const total = rainAmt + snowAmt;
      rainProb = Math.round((rainAmt / total) * precipProb);
      snowProb = Math.round((snowAmt / total) * precipProb);
    } else {
      if (temp <= 2) {
        snowProb = precipProb;
      } else {
        rainProb = precipProb;
      }
    }
  }

  return { rainProb, snowProb };
}

/**
 * Get precipitation probability at a later hour
 */
function getLaterPrecipProb(
  precipProbs: number[],
  rain: number[],
  snowfall: number[],
  temps: number[],
  hourIndex: number,
  hoursForward: number
): { rainProb: number; snowProb: number } {
  const laterIndex = hourIndex + hoursForward;
  if (laterIndex >= precipProbs.length) {
    return { rainProb: 0, snowProb: 0 };
  }

  const precipProb = precipProbs[laterIndex] || 0;
  const rainAmt = rain[laterIndex] || 0;
  const snowAmt = snowfall[laterIndex] || 0;
  const temp = temps[laterIndex] || 0;

  let rainProb = 0;
  let snowProb = 0;

  if (precipProb > 0) {
    if (snowAmt > 0 && rainAmt === 0) {
      snowProb = precipProb;
    } else if (rainAmt > 0 && snowAmt === 0) {
      rainProb = precipProb;
    } else if (snowAmt > 0 && rainAmt > 0) {
      const total = rainAmt + snowAmt;
      rainProb = Math.round((rainAmt / total) * precipProb);
      snowProb = Math.round((snowAmt / total) * precipProb);
    } else {
      if (temp <= 2) {
        snowProb = precipProb;
      } else {
        rainProb = precipProb;
      }
    }
  }

  return { rainProb, snowProb };
}

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

    // Calculate accumulated precipitation for 1h, 2h, and 4h before arrival
    const accumulatedRain1h = sumPrecipitation(data.hourly.rain, hourIndex, 1);
    const accumulatedSnow1h = sumPrecipitation(data.hourly.snowfall, hourIndex, 1);
    const accumulatedRain2h = sumPrecipitation(data.hourly.rain, hourIndex, 2);
    const accumulatedSnow2h = sumPrecipitation(data.hourly.snowfall, hourIndex, 2);
    const accumulatedRain4h = sumPrecipitation(data.hourly.rain, hourIndex, 4);
    const accumulatedSnow4h = sumPrecipitation(data.hourly.snowfall, hourIndex, 4);

    // Get earlier precipitation probabilities
    const earlier4h = getEarlierPrecipProb(
      data.hourly.precipitation_probability,
      data.hourly.rain,
      data.hourly.snowfall,
      data.hourly.temperature_2m,
      hourIndex,
      4
    );
    const earlier8h = getEarlierPrecipProb(
      data.hourly.precipitation_probability,
      data.hourly.rain,
      data.hourly.snowfall,
      data.hourly.temperature_2m,
      hourIndex,
      8
    );
    const earlier12h = getEarlierPrecipProb(
      data.hourly.precipitation_probability,
      data.hourly.rain,
      data.hourly.snowfall,
      data.hourly.temperature_2m,
      hourIndex,
      12
    );

    // Get later precipitation probabilities
    const later4h = getLaterPrecipProb(
      data.hourly.precipitation_probability,
      data.hourly.rain,
      data.hourly.snowfall,
      data.hourly.temperature_2m,
      hourIndex,
      4
    );
    const later8h = getLaterPrecipProb(
      data.hourly.precipitation_probability,
      data.hourly.rain,
      data.hourly.snowfall,
      data.hourly.temperature_2m,
      hourIndex,
      8
    );
    const later12h = getLaterPrecipProb(
      data.hourly.precipitation_probability,
      data.hourly.rain,
      data.hourly.snowfall,
      data.hourly.temperature_2m,
      hourIndex,
      12
    );

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
      rainProbability4hEarlier: earlier4h.rainProb,
      snowProbability4hEarlier: earlier4h.snowProb,
      rainProbability8hEarlier: earlier8h.rainProb,
      snowProbability8hEarlier: earlier8h.snowProb,
      rainProbability12hEarlier: earlier12h.rainProb,
      snowProbability12hEarlier: earlier12h.snowProb,
      rainProbability4hLater: later4h.rainProb,
      snowProbability4hLater: later4h.snowProb,
      rainProbability8hLater: later8h.rainProb,
      snowProbability8hLater: later8h.snowProb,
      rainProbability12hLater: later12h.rainProb,
      snowProbability12hLater: later12h.snowProb,
      accumulatedRain1h,
      accumulatedSnow1h,
      accumulatedRain2h,
      accumulatedSnow2h,
      accumulatedRain4h,
      accumulatedSnow4h,
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

      // Fetch weather and alerts in parallel
      const [weather, alerts] = await Promise.all([
        fetchWeatherForLocation(
          step.city.coordinates.lat,
          step.city.coordinates.lng,
          arrivalTime
        ),
        fetchAlertsForLocation(
          step.city.coordinates.lat,
          step.city.coordinates.lng
        ),
      ]);

      return {
        ...step,
        arrivalTime,
        weather: weather || undefined,
        alerts: alerts.length > 0 ? alerts : undefined,
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

/**
 * Convert mm to inches
 */
export function mmToInches(mm: number): number {
  return Math.round(mm * 0.0393701 * 100) / 100;
}

/**
 * Convert cm to inches
 */
export function cmToInches(cm: number): number {
  return Math.round(cm * 0.393701 * 10) / 10;
}

/**
 * Format accumulated rain with unit
 */
export function formatRain(
  mm: number,
  unit: "celsius" | "fahrenheit"
): string {
  if (unit === "fahrenheit") {
    if (mm === 0) return "0\"";
    const inches = mmToInches(mm);
    return inches < 0.01 ? "<0.01\"" : `${inches}"`;
  }
  if (mm === 0) return "0mm";
  return `${mm}mm`;
}

/**
 * Format accumulated snow with unit
 */
export function formatSnow(
  cm: number,
  unit: "celsius" | "fahrenheit"
): string {
  if (unit === "fahrenheit") {
    if (cm === 0) return "0\"";
    const inches = cmToInches(cm);
    return inches < 0.1 ? "<0.1\"" : `${inches}"`;
  }
  if (cm === 0) return "0cm";
  return `${cm}cm`;
}
