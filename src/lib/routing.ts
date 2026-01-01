import { City, RouteStep } from "./types";

const MAPBOX_DIRECTIONS_URL =
  "https://api.mapbox.com/directions/v5/mapbox/driving";
const MAPBOX_GEOCODING_URL = "https://api.mapbox.com/geocoding/v5/mapbox.places";

interface Coordinate {
  lng: number;
  lat: number;
}

interface DirectionsRoute {
  geometry: {
    coordinates: [number, number][]; // [lng, lat][]
  };
  duration: number; // seconds
  distance: number; // meters
}

interface DirectionsResponse {
  routes: DirectionsRoute[];
  code: string;
}

/**
 * Get driving directions between two cities
 */
export async function getDirections(
  origin: City,
  destination: City
): Promise<DirectionsRoute | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!token) {
    console.error("Mapbox token not configured");
    return null;
  }

  try {
    const coordinates = `${origin.coordinates.lng},${origin.coordinates.lat};${destination.coordinates.lng},${destination.coordinates.lat}`;

    const params = new URLSearchParams({
      access_token: token,
      geometries: "geojson",
      overview: "full",
    });

    const response = await fetch(
      `${MAPBOX_DIRECTIONS_URL}/${coordinates}?${params}`
    );

    if (!response.ok) {
      throw new Error(`Directions API error: ${response.status}`);
    }

    const data: DirectionsResponse = await response.json();

    if (data.code !== "Ok" || !data.routes.length) {
      throw new Error("No route found");
    }

    return data.routes[0];
  } catch (error) {
    console.error("Error getting directions:", error);
    return null;
  }
}

/**
 * Reverse geocode a coordinate to get the nearest city/place
 */
async function reverseGeocode(coord: Coordinate): Promise<City | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!token) return null;

  try {
    const params = new URLSearchParams({
      access_token: token,
      types: "place,locality,neighborhood",
      limit: "1",
      language: "en",
    });

    const response = await fetch(
      `${MAPBOX_GEOCODING_URL}/${coord.lng},${coord.lat}.json?${params}`
    );

    if (!response.ok) return null;

    const data = await response.json();

    if (!data.features?.length) return null;

    const feature = data.features[0];
    return {
      name: feature.text,
      fullName: feature.place_name,
      coordinates: {
        lng: coord.lng,
        lat: coord.lat,
      },
    };
  } catch {
    return null;
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function haversineDistance(coord1: Coordinate, coord2: Coordinate): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) *
      Math.cos(toRad(coord2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Interpolate a point along the route at a given fraction (0-1)
 */
function interpolateAlongRoute(
  coordinates: [number, number][],
  fraction: number
): Coordinate {
  if (fraction <= 0) {
    return { lng: coordinates[0][0], lat: coordinates[0][1] };
  }
  if (fraction >= 1) {
    const last = coordinates[coordinates.length - 1];
    return { lng: last[0], lat: last[1] };
  }

  // Calculate cumulative distances along the route
  const distances: number[] = [0];
  let totalDistance = 0;

  for (let i = 1; i < coordinates.length; i++) {
    const dist = haversineDistance(
      { lng: coordinates[i - 1][0], lat: coordinates[i - 1][1] },
      { lng: coordinates[i][0], lat: coordinates[i][1] }
    );
    totalDistance += dist;
    distances.push(totalDistance);
  }

  const targetDistance = totalDistance * fraction;

  // Find the segment containing the target distance
  for (let i = 1; i < distances.length; i++) {
    if (distances[i] >= targetDistance) {
      const segmentStart = distances[i - 1];
      const segmentLength = distances[i] - segmentStart;
      const segmentFraction =
        segmentLength > 0 ? (targetDistance - segmentStart) / segmentLength : 0;

      const startCoord = coordinates[i - 1];
      const endCoord = coordinates[i];

      return {
        lng: startCoord[0] + (endCoord[0] - startCoord[0]) * segmentFraction,
        lat: startCoord[1] + (endCoord[1] - startCoord[1]) * segmentFraction,
      };
    }
  }

  const last = coordinates[coordinates.length - 1];
  return { lng: last[0], lat: last[1] };
}

/**
 * Calculate route steps based on time intervals
 */
export async function calculateRouteSteps(
  origin: City,
  destination: City,
  timeStepHours: number
): Promise<RouteStep[]> {
  const route = await getDirections(origin, destination);

  if (!route) {
    throw new Error("Could not calculate route");
  }

  const totalDurationHours = route.duration / 3600;
  const coordinates = route.geometry.coordinates;

  // Calculate number of steps (including start and end)
  const numSteps = Math.max(2, Math.ceil(totalDurationHours / timeStepHours) + 1);

  const steps: RouteStep[] = [];

  // Add origin as first step
  steps.push({
    city: origin,
    timeOffset: 0,
  });

  // Add intermediate steps
  for (let i = 1; i < numSteps - 1; i++) {
    const timeOffset = i * timeStepHours;

    // Don't add steps beyond the journey duration
    if (timeOffset >= totalDurationHours) break;

    const fraction = timeOffset / totalDurationHours;
    const coord = interpolateAlongRoute(coordinates, fraction);

    // Reverse geocode to get city name
    const city = await reverseGeocode(coord);

    if (city) {
      // Avoid duplicate cities
      const lastCity = steps[steps.length - 1].city;
      if (city.name !== lastCity.name) {
        steps.push({
          city,
          timeOffset,
        });
      }
    }
  }

  // Add destination as last step
  steps.push({
    city: destination,
    timeOffset: Math.round(totalDurationHours * 10) / 10, // Round to 1 decimal
  });

  return steps;
}

/**
 * Format time offset for display
 */
export function formatTimeOffset(hours: number): string {
  if (hours === 0) return "Start";

  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);

  if (h === 0) return `+${m}m`;
  if (m === 0) return `+${h}h`;
  return `+${h}h ${m}m`;
}
