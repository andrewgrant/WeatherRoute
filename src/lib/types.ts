export interface City {
  name: string;
  fullName: string; // includes region/country
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface RouteStep {
  city: City;
  timeOffset: number; // hours from start
  arrivalTime?: Date;
}

export interface RouteParams {
  origin: City;
  destination: City;
  timeStepHours: number;
  startTime: Date;
}
