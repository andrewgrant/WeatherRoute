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
}

export interface RouteStep {
  city: City;
  timeOffset: number; // hours from start
  arrivalTime?: Date;
  weather?: Weather;
}

export interface RouteParams {
  origin: City;
  destination: City;
  timeStepHours: number;
  startTime: Date;
}

export type TemperatureUnit = "celsius" | "fahrenheit";
