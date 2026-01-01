import { City } from "./types";

/**
 * Serialize a city to a URL-safe string
 * Format: lat,lng|name|fullName
 */
export function serializeCity(city: City): string {
  const { coordinates, name, fullName } = city;
  return `${coordinates.lat},${coordinates.lng}|${name}|${fullName}`;
}

/**
 * Deserialize a city from URL string
 */
export function deserializeCity(str: string): City | null {
  try {
    const [coords, name, fullName] = str.split("|");
    const [lat, lng] = coords.split(",").map(Number);

    if (isNaN(lat) || isNaN(lng) || !name || !fullName) {
      return null;
    }

    return {
      name,
      fullName,
      coordinates: { lat, lng },
    };
  } catch {
    return null;
  }
}

/**
 * Serialize a date to URL-safe ISO string
 */
export function serializeDate(date: Date): string {
  return date.toISOString();
}

/**
 * Deserialize a date from ISO string
 */
export function deserializeDate(str: string): Date | null {
  try {
    const date = new Date(str);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  } catch {
    return null;
  }
}

export interface RouteUrlState {
  origin: City | null;
  destination: City | null;
  departureTime: Date | null;
  timeOffset: number;
  timeStepHours: number;
}

/**
 * Parse route state from URL search params
 */
export function parseRouteFromUrl(searchParams: URLSearchParams): RouteUrlState {
  const originStr = searchParams.get("from");
  const destStr = searchParams.get("to");
  const timeStr = searchParams.get("time");
  const offsetStr = searchParams.get("offset");
  const stepStr = searchParams.get("step");

  return {
    origin: originStr ? deserializeCity(decodeURIComponent(originStr)) : null,
    destination: destStr ? deserializeCity(decodeURIComponent(destStr)) : null,
    departureTime: timeStr ? deserializeDate(timeStr) : null,
    timeOffset: offsetStr ? parseFloat(offsetStr) : 0,
    timeStepHours: stepStr ? parseFloat(stepStr) : 2,
  };
}

/**
 * Build URL search params from route state
 */
export function buildRouteUrl(state: {
  origin: City | null;
  destination: City | null;
  departureTime: Date;
  timeOffset: number;
  timeStepHours: number;
}): string {
  const params = new URLSearchParams();

  if (state.origin) {
    params.set("from", serializeCity(state.origin));
  }
  if (state.destination) {
    params.set("to", serializeCity(state.destination));
  }
  if (state.departureTime) {
    params.set("time", serializeDate(state.departureTime));
  }
  if (state.timeOffset !== 0) {
    params.set("offset", state.timeOffset.toString());
  }
  if (state.timeStepHours !== 2) {
    params.set("step", state.timeStepHours.toString());
  }

  const paramString = params.toString();
  return paramString ? `?${paramString}` : "";
}
