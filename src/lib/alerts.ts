import { WeatherAlert } from "./types";

const NWS_ALERTS_URL = "https://api.weather.gov/alerts/active";

interface NWSAlertFeature {
  id: string;
  properties: {
    event: string;
    severity: "Extreme" | "Severe" | "Moderate" | "Minor" | "Unknown";
    urgency: string;
    headline: string;
    description: string;
    instruction: string | null;
    expires: string;
  };
}

interface NWSAlertsResponse {
  features: NWSAlertFeature[];
}

/**
 * Check if coordinates are within the continental US (rough bounding box)
 * Also includes Alaska and Hawaii
 */
export function isUSLocation(lat: number, lng: number): boolean {
  // Continental US: roughly 24°N to 49°N, 125°W to 66°W
  const isConUS =
    lat >= 24 && lat <= 49 && lng >= -125 && lng <= -66;

  // Alaska: roughly 51°N to 72°N, 180°W to 130°W
  const isAlaska =
    lat >= 51 && lat <= 72 && lng >= -180 && lng <= -130;

  // Hawaii: roughly 18°N to 23°N, 161°W to 154°W
  const isHawaii =
    lat >= 18 && lat <= 23 && lng >= -161 && lng <= -154;

  return isConUS || isAlaska || isHawaii;
}

/**
 * Fetch active weather alerts for a US location
 * Returns empty array for non-US locations
 */
export async function fetchAlertsForLocation(
  lat: number,
  lng: number
): Promise<WeatherAlert[]> {
  // Only fetch for US locations
  if (!isUSLocation(lat, lng)) {
    return [];
  }

  try {
    const params = new URLSearchParams({
      point: `${lat.toFixed(4)},${lng.toFixed(4)}`,
    });

    const response = await fetch(`${NWS_ALERTS_URL}?${params}`, {
      headers: {
        "User-Agent": "(RoadTripConditions, contact@example.com)",
        Accept: "application/geo+json",
      },
    });

    if (!response.ok) {
      // NWS API can be flaky, don't throw errors
      console.warn(`NWS API returned ${response.status}`);
      return [];
    }

    const data: NWSAlertsResponse = await response.json();

    if (!data.features || !Array.isArray(data.features)) {
      return [];
    }

    // Map and filter alerts
    const alerts: WeatherAlert[] = data.features
      .map((feature) => ({
        id: feature.id,
        event: feature.properties.event,
        severity: feature.properties.severity,
        urgency: feature.properties.urgency,
        headline: feature.properties.headline,
        description: feature.properties.description,
        instruction: feature.properties.instruction || "",
        expires: new Date(feature.properties.expires),
      }))
      // Filter out expired alerts
      .filter((alert) => alert.expires > new Date())
      // Sort by severity (most severe first)
      .sort((a, b) => {
        const severityOrder = {
          Extreme: 0,
          Severe: 1,
          Moderate: 2,
          Minor: 3,
          Unknown: 4,
        };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });

    return alerts;
  } catch (error) {
    console.error("Error fetching NWS alerts:", error);
    return [];
  }
}

/**
 * Get color class for alert severity
 */
export function getAlertSeverityColor(
  severity: WeatherAlert["severity"]
): string {
  switch (severity) {
    case "Extreme":
      return "text-red-600 bg-red-50 border-red-200";
    case "Severe":
      return "text-orange-600 bg-orange-50 border-orange-200";
    case "Moderate":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "Minor":
      return "text-blue-600 bg-blue-50 border-blue-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
}

/**
 * Get icon color for alert severity badge
 */
export function getAlertIconColor(
  severity: WeatherAlert["severity"]
): string {
  switch (severity) {
    case "Extreme":
      return "text-red-500";
    case "Severe":
      return "text-orange-500";
    case "Moderate":
      return "text-yellow-500";
    case "Minor":
      return "text-blue-500";
    default:
      return "text-gray-500";
  }
}
