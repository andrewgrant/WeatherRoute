export interface City {
  name: string;
  fullName: string; // includes region/country
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Weather {
  temperature: number; // in Celsius
  weatherCode: number; // WMO weather code
  rainProbability: number; // percentage
  snowProbability: number; // percentage
  windSpeed: number; // km/h
  elevation: number; // meters
  accumulatedRain4h: number; // mm in 4 hours before arrival
  accumulatedSnow4h: number; // cm in 4 hours before arrival
  accumulatedRain12h: number; // mm in 12 hours before arrival
  accumulatedSnow12h: number; // cm in 12 hours before arrival
}

export interface WeatherAlert {
  id: string;
  event: string; // "Winter Storm Warning", "Flood Watch"
  severity: "Extreme" | "Severe" | "Moderate" | "Minor" | "Unknown";
  urgency: string; // "Immediate", "Expected", "Future"
  headline: string;
  description: string;
  instruction: string;
  expires: Date;
}

export interface RouteStep {
  city: City;
  timeOffset: number; // hours from start
  arrivalTime?: Date;
  weather?: Weather;
  alerts?: WeatherAlert[];
  isManualWaypoint?: boolean; // true if user added this waypoint manually
}

export interface RouteParams {
  origin: City;
  destination: City;
  timeStepHours: number;
  startTime: Date;
}

export type TemperatureUnit = "celsius" | "fahrenheit";
