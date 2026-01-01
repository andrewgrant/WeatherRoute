# WeatherRoute - Implementation Plan

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

## Future Enhancements (Not in Initial Scope)

These are noted for later phases:

- [ ] Additional weather sources (OpenWeatherMap, WeatherAPI, etc.)
- [ ] Google Maps as alternative routing provider
- [ ] Visual map showing route and waypoints
- [ ] Save favorite routes (would need database)
- [ ] Weather alerts/warnings along route
- [ ] Multiple route options (fastest, scenic, etc.)
- [ ] Offline support / PWA
- [ ] Historical weather (past date analysis)

---

## API Keys Required

| Service | How to Obtain |
|---------|---------------|
| Mapbox | Sign up at [mapbox.com](https://mapbox.com), get public token from account dashboard |
| Open-Meteo | None required |

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
