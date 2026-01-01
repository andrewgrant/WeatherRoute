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
  // Earlier predictions (probability at hours before arrival)
  rainProbability4hEarlier: number;
  snowProbability4hEarlier: number;
  rainProbability8hEarlier: number;
  snowProbability8hEarlier: number;
  rainProbability12hEarlier: number;
  snowProbability12hEarlier: number;
  // Later predictions (probability at hours after arrival)
  rainProbability4hLater: number;
  snowProbability4hLater: number;
  rainProbability8hLater: number;
  snowProbability8hLater: number;
  rainProbability12hLater: number;
  snowProbability12hLater: number;
  // Accumulated precipitation before arrival
  accumulatedRain1h: number; // mm in 1 hour before arrival
  accumulatedSnow1h: number; // cm in 1 hour before arrival
  accumulatedRain2h: number; // mm in 2 hours before arrival
  accumulatedSnow2h: number; // cm in 2 hours before arrival
  accumulatedRain4h: number; // mm in 4 hours before arrival
  accumulatedSnow4h: number; // cm in 4 hours before arrival
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
