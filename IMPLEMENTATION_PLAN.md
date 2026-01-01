# Road Trip Conditions - Implementation Plan

A web app that shows weather forecasts along a driving route, broken into time-based steps.

## Tech Stack

| Component | Choice |
|-----------|--------|
| Framework | Next.js (App Router) |
| Styling | Tailwind CSS |
| Icons | Lucide React (minimalist) |
| Deployment | Vercel |
| Routing/Geocoding | Mapbox (Directions + Geocoding APIs) |
| Weather | Open-Meteo (free, no API key) |
| State/Sharing | URL parameters |

## Requirements Summary

- Enter start city and destination city with autocomplete
- Specify time step (hours) to break journey into segments
- Show list of cities/waypoints along the route in ascending time order
- Date/time picker for departure with ±24 hour slider
- Weather display for each step showing arrival-time forecast
- Temperature (with F/C toggle), conditions icon, precipitation chance
- Shareable via URL parameters
- Mobile responsive

---

## Phase 1: Project Setup & Foundation

**Goal**: Get a deployable Next.js app with basic structure

**Tasks**:
- [x] Initialize Next.js 14+ with App Router
- [x] Configure Tailwind CSS
- [x] Set up project folder structure:
  ```
  /src
    /app
    /components
    /lib
  ```
- [x] Create basic responsive layout shell (header, main content area)
- [x] Set up environment variables structure (`.env.example`)
- [x] Configure for Vercel deployment
- [x] Add basic metadata (title, description)
- [x] Install Lucide React for icons

**Deliverable**: Empty app shell deployed to Vercel - **COMPLETE**

---

## Phase 2: City Input & Geocoding

**Goal**: Working city autocomplete with Mapbox Geocoding

**Tasks**:
- [x] Set up Mapbox account and obtain API token
- [x] Create reusable `CityAutocomplete` component
  - Debounced input (300ms)
  - Dropdown with suggestions
  - Returns city name + coordinates
  - Keyboard navigation support
- [x] Create form with:
  - Start city input
  - Destination city input
  - Time step input (hours, number field)
  - "Plan Route" button
- [x] Store selected cities in component state
- [x] Basic form validation (both cities required, valid time step)

**Deliverable**: Form that captures start/end cities with autocomplete - **COMPLETE**

---

## Phase 3: Route Calculation & Time Steps

**Goal**: Break a route into time-based waypoints using Mapbox Directions

**Tasks**:
- [x] Integrate Mapbox Directions API
  - Request route between start and destination
  - Get route geometry (GeoJSON) and total duration
- [x] Implement step calculation algorithm:
  - Given total duration and time step, calculate number of stops
  - Interpolate points along the route using Haversine distance
  - For each point, reverse geocode to find nearest city/town name
  - Avoid duplicate consecutive cities
- [x] Create `RouteSteps` component to display:
  - Ordered list of waypoints with connector lines
  - City name and full address
  - Time offset from start (e.g., "Start", "+2h", "+4h 30m")
  - Journey summary (total time, number of stops)
- [x] Handle edge cases:
  - Very short routes (minimum 2 stops: start and end)
  - Time step longer than total journey
  - Loading and error states

**Deliverable**: List of cities along route with time offsets - **COMPLETE**

---

## Phase 4: Weather Integration

**Goal**: Show weather forecasts for each waypoint at arrival time

**Tasks**:
- [x] Integrate Open-Meteo API
  - Fetch hourly forecast for each waypoint's coordinates
  - Get temperature, weather code, precipitation probability, snowfall
- [x] Create weather data fetching logic:
  - Parallel fetch for all waypoints using Promise.all
  - Map arrival time to correct forecast hour (16-day range)
- [x] Create `WeatherDisplay` component for each step:
  - Temperature (numeric with unit)
  - Condition icon (Lucide icons for sun, clouds, rain, snow, etc.)
  - Precipitation chance (percentage + rain/snow icon)
- [x] Implement F/C temperature toggle
  - Store preference in localStorage using useSyncExternalStore
  - Cross-tab sync support
- [x] Map Open-Meteo WMO weather codes to icons and descriptions
- [x] Add departure time selector
  - Weather updates based on arrival time at each stop
  - Shows formatted arrival time for each waypoint

**Deliverable**: Route list with weather data for each stop - **COMPLETE**

---

## Phase 5: Date/Time Picker & Slider

**Goal**: Control departure time with live-updating weather

**Tasks**:
- [x] Add date/time picker component
  - Native datetime-local input
  - Defaults to current date/time
  - Resets slider offset when changed
- [x] Add ±24 hour slider (TimeSlider component)
  - Range: -24 to +24 hours with 30-min steps
  - Updates weather in real-time as user drags
  - Shows current offset (e.g., "+2h", "-30m", "Now")
  - Quick adjust buttons (±1 hour)
  - Center marker at "Now" position
- [x] Optimize for live updates:
  - 150ms debounce on slider drag
  - Skip fetches for small offset changes (<15min)
  - Smooth loading states
- [x] Recalculate all waypoint weather when time changes
- [x] Display effective departure time prominently
  - Shows "Today at 3:00 PM", "Tomorrow at 9:00 AM", etc.

**Deliverable**: Interactive time controls with live weather updates - **COMPLETE**

---

## Phase 6: URL Sharing & Polish

**Goal**: Shareable links and production-ready UI

**Tasks**:
- [ ] Implement URL parameter encoding:
  - `from` - start city (name or coords)
  - `to` - destination city (name or coords)
  - `step` - time step in hours
  - `start` - departure timestamp
  - `unit` - temperature unit (f/c)
- [ ] Parse URL params on page load to restore state
- [ ] Add "Copy Link" / "Share" button
- [ ] Loading states for all async operations
- [ ] Error handling and user-friendly error messages:
  - API failures
  - Invalid routes
  - City not found
- [ ] Empty states (before route is entered)
- [ ] Mobile responsive polish:
  - Touch-friendly controls
  - Appropriate spacing
  - Readable on small screens
- [ ] Accessibility basics (labels, focus states, contrast)

**Deliverable**: Polished, shareable app ready for use

---

## Phase 7: Enhanced Weather Data & Manual Waypoints

**Goal**: Add accumulated precipitation, manual waypoint insertion, NWS alerts, and better defaults

### 7.1: Accumulated Precipitation (4h and 12h before arrival)

**Purpose**: Show road conditions leading up to arrival (wet roads, snow accumulation)

**Files to modify**:

**`src/lib/types.ts`**:
```typescript
export interface Weather {
  // ... existing fields ...
  accumulatedRain4h: number;   // mm in 4 hours before arrival
  accumulatedSnow4h: number;   // cm in 4 hours before arrival
  accumulatedRain12h: number;  // mm in 12 hours before arrival
  accumulatedSnow12h: number;  // cm in 12 hours before arrival
}
```

**`src/lib/weather.ts`**:
- Modify `fetchWeatherForLocation()` to:
  - Find the hourIndex for arrival time (already done)
  - Look back 4 hours and 12 hours from that index
  - Sum `rain` values for those windows
  - Sum `snowfall` values for those windows
  - Handle edge cases (arrival within first 4/12 hours of forecast)

**`src/components/WeatherDisplay.tsx`**:
- Add section showing accumulated precipitation
- Format: "Past 4h: 2.5mm rain, 1cm snow"
- Format: "Past 12h: 8mm rain, 3cm snow"
- Use appropriate icons (umbrella for rain, snowflake for snow)
- Consider color coding based on severity

---

### 7.2: Manual Waypoint Insertion

**Purpose**: Allow users to add custom stops that appear at correct time offset

**New files**:

**`src/components/AddWaypointButton.tsx`**:
- Button that expands to show city autocomplete
- Uses existing `CityAutocomplete` component
- "Add Stop" and "Cancel" buttons
- Compact design that fits below route steps

**Files to modify**:

**`src/lib/routing.ts`**:
- New function:
```typescript
export async function calculateDrivingTime(
  origin: City,
  waypoint: City
): Promise<number> // Returns hours
```
- Uses Mapbox Directions API (already integrated)
- Returns driving time from origin to waypoint

**`src/app/page.tsx`**:
- New state: `manualWaypoints: RouteStep[]`
- Function to add waypoint:
  1. Calculate driving time from origin to waypoint
  2. Create RouteStep with that timeOffset
  3. Merge into routeSteps array, sorted by timeOffset
  4. Fetch weather for new waypoint
- Mark manual waypoints differently (different icon/style)

**`src/components/RouteSteps.tsx`**:
- Accept `onAddWaypoint` prop
- Show AddWaypointButton at bottom of list
- Distinguish manual waypoints visually (e.g., different icon, "Added" label)
- Option to remove manual waypoints

---

### 7.3: Default Departure Time (9am Tomorrow)

**Files to modify**:

**`src/app/page.tsx`**:
- Change initial `baseTime` state:
```typescript
const getDefaultDepartureTime = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  return tomorrow;
};

const [baseTime, setBaseTime] = useState<Date>(getDefaultDepartureTime);
```

---

### 7.4: National Weather Service Alerts

**Purpose**: Show active weather warnings for US locations

**API**: `https://api.weather.gov/alerts/active?point={lat},{lon}` (free, no key)

**New files**:

**`src/lib/alerts.ts`**:
```typescript
export interface WeatherAlert {
  id: string;
  event: string;        // "Winter Storm Warning", "Flood Watch"
  severity: "Extreme" | "Severe" | "Moderate" | "Minor" | "Unknown";
  urgency: string;      // "Immediate", "Expected", "Future"
  headline: string;
  description: string;
  instruction: string;
  expires: Date;
}

export async function fetchAlertsForLocation(
  lat: number,
  lng: number
): Promise<WeatherAlert[]>

// Check if coordinates are in the US (rough bounding box)
export function isUSLocation(lat: number, lng: number): boolean
```

**Files to modify**:

**`src/lib/types.ts`**:
```typescript
export interface RouteStep {
  // ... existing fields ...
  alerts?: WeatherAlert[];
}
```

**`src/lib/weather.ts`**:
- Import `fetchAlertsForLocation`, `isUSLocation`
- In `fetchWeatherForRoute()`, also fetch alerts for US locations
- Skip alerts fetch for non-US locations

**`src/components/WeatherDisplay.tsx`**:
- Add alert indicator (⚠️ icon with count)
- Color by severity:
  - Extreme: red
  - Severe: orange
  - Moderate: yellow
  - Minor: blue
- Expandable to show alert details
- Show headline and expiration time

**New component `src/components/AlertBadge.tsx`** (optional):
- Small badge showing alert count
- Tooltip or expandable with alert details
- Accessible (screen reader support)

---

### Implementation Order

1. **Default departure time** (5 min) - Quick win
2. **Accumulated precipitation** (30 min) - Extends existing weather fetch
3. **NWS Alerts** (45 min) - New API integration
4. **Manual waypoints** (1 hr) - Most complex, new UI components

---

**Deliverable**: Enhanced weather data with road conditions, custom waypoints, and severe weather alerts

---

## Future Enhancements (Not in Initial Scope)

These are noted for later phases:

- [ ] Additional weather sources (OpenWeatherMap, WeatherAPI, etc.)
- [ ] Google Maps as alternative routing provider
- [ ] Visual map showing route and waypoints
- [ ] Save favorite routes (would need database)
- [ ] Multiple route options (fastest, scenic, etc.)
- [ ] Offline support / PWA
- [ ] Historical weather (past date analysis)

---

## API Keys Required

| Service | How to Obtain |
|---------|---------------|
| Mapbox | Sign up at [mapbox.com](https://mapbox.com), get public token from account dashboard |
| Open-Meteo | None required |
| NWS Alerts | None required (free public API, US only) |

---

## Environment Variables

```env
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_public_token
```

---

## Estimated Phases Breakdown

| Phase | Description |
|-------|-------------|
| 1 | Project Setup & Foundation |
| 2 | City Input & Geocoding |
| 3 | Route Calculation & Time Steps |
| 4 | Weather Integration |
| 5 | Date/Time Picker & Slider |
| 6 | URL Sharing & Polish |

---

## Design Decisions

| Decision | Choice |
|----------|--------|
| F/C Preference | Persist in localStorage |
| Icons | Lucide (minimalist line icons) |
| Color Scheme | Light, clean, neutral (see palette below) |

### Color Palette

```
Background:     #FAFAFA (near white)
Surface/Cards:  #FFFFFF (white)
Border:         #E5E7EB (gray-200)
Text Primary:   #1F2937 (gray-800)
Text Secondary: #6B7280 (gray-500)
Accent:         #3B82F6 (blue-500)
Accent Hover:   #2563EB (blue-600)

Weather Colors:
  Sunny:        #FBBF24 (amber-400)
  Cloudy:       #9CA3AF (gray-400)
  Rain:         #60A5FA (blue-400)
  Snow:         #E0F2FE (sky-100)
  Storm:        #4B5563 (gray-600)
```
