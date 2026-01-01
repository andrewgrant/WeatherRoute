import { City } from "./types";

const MAPBOX_API_URL = "https://api.mapbox.com/geocoding/v5/mapbox.places";

interface MapboxFeature {
  id: string;
  place_name: string;
  text: string;
  center: [number, number]; // [lng, lat]
  place_type: string[];
}

interface MapboxResponse {
  features: MapboxFeature[];
}

export async function searchCities(query: string): Promise<City[]> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!token) {
    console.error("Mapbox token not configured");
    return [];
  }

  if (!query || query.length < 2) {
    return [];
  }

  try {
    const params = new URLSearchParams({
      access_token: token,
      types: "place,locality",
      limit: "5",
      language: "en",
    });

    const response = await fetch(
      `${MAPBOX_API_URL}/${encodeURIComponent(query)}.json?${params}`
    );

    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`);
    }

    const data: MapboxResponse = await response.json();

    return data.features.map((feature) => ({
      name: feature.text,
      fullName: feature.place_name,
      coordinates: {
        lng: feature.center[0],
        lat: feature.center[1],
      },
    }));
  } catch (error) {
    console.error("Error searching cities:", error);
    return [];
  }
}
