import { City } from "./types";

/**
 * Waypoint with time offset for URL serialization
 */
export interface UrlWaypoint {
  city: City;
  timeOffset: number;
}

/**
 * Serialize a city to a URL-safe string
 * Format: lat,lng|name|fullName
 */
export function serializeCity(city: City): string {
  const { coordinates, name, fullName } = city;
  return `${coordinates.lat},${coordinates.lng}|${name}|${fullName}`;
}

/**
 * Serialize a waypoint (city + time offset)
 * Format: lat,lng|name|fullName|timeOffset
 */
export function serializeWaypoint(waypoint: UrlWaypoint): string {
  const { city, timeOffset } = waypoint;
  return `${city.coordinates.lat},${city.coordinates.lng}|${city.name}|${city.fullName}|${timeOffset}`;
}

/**
 * Deserialize a waypoint from URL string
 */
export function deserializeWaypoint(str: string): UrlWaypoint | null {
  try {
    const [coords, name, fullName, offsetStr] = str.split("|");
    const [lat, lng] = coords.split(",").map(Number);
    const timeOffset = parseFloat(offsetStr);

    if (isNaN(lat) || isNaN(lng) || !name || !fullName || isNaN(timeOffset)) {
      return null;
    }

    return {
      city: {
        name,
        fullName,
        coordinates: { lat, lng },
      },
      timeOffset,
    };
  } catch {
    return null;
  }
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
  waypoints: UrlWaypoint[];
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
  const waypointsStr = searchParams.get("waypoints");

  // Parse waypoints (semicolon-separated)
  const waypoints: UrlWaypoint[] = [];
  if (waypointsStr) {
    const waypointStrs = decodeURIComponent(waypointsStr).split(";");
    for (const wpStr of waypointStrs) {
      const waypoint = deserializeWaypoint(wpStr);
      if (waypoint) {
        waypoints.push(waypoint);
      }
    }
  }

  return {
    origin: originStr ? deserializeCity(decodeURIComponent(originStr)) : null,
    destination: destStr ? deserializeCity(decodeURIComponent(destStr)) : null,
    departureTime: timeStr ? deserializeDate(timeStr) : null,
    timeOffset: offsetStr ? parseFloat(offsetStr) : 0,
    timeStepHours: stepStr ? parseFloat(stepStr) : 2,
    waypoints,
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
  waypoints?: UrlWaypoint[];
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
  if (state.waypoints && state.waypoints.length > 0) {
    const waypointsStr = state.waypoints.map(serializeWaypoint).join(";");
    params.set("waypoints", waypointsStr);
  }

  const paramString = params.toString();
  return paramString ? `?${paramString}` : "";
}
