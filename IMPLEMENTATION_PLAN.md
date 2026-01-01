# WeatherRoute - Implementation Plan

A web app that shows weather forecasts along a driving route, broken into time-based steps.

## Tech Stack

| Component | Choice |
|-----------|--------|
| Framework | Next.js (App Router) |
| Styling | Tailwind CSS |
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
- [ ] Initialize Next.js 14+ with App Router
- [ ] Configure Tailwind CSS
- [ ] Set up project folder structure:
  ```
  /app
    /components
    /lib
    /api (if needed for proxying)
  ```
- [ ] Create basic responsive layout shell (header, main content area)
- [ ] Set up environment variables structure (`.env.example`)
- [ ] Configure for Vercel deployment
- [ ] Add basic metadata (title, description)

**Deliverable**: Empty app shell deployed to Vercel

---

## Phase 2: City Input & Geocoding

**Goal**: Working city autocomplete with Mapbox Geocoding

**Tasks**:
- [ ] Set up Mapbox account and obtain API token
- [ ] Create reusable `CityAutocomplete` component
  - Debounced input
  - Dropdown with suggestions
  - Returns city name + coordinates
- [ ] Create form with:
  - Start city input
  - Destination city input
  - Time step input (hours, number field)
  - "Plan Route" button
- [ ] Store selected cities in component state
- [ ] Basic form validation (both cities required, valid time step)

**Deliverable**: Form that captures start/end cities with autocomplete

---

## Phase 3: Route Calculation & Time Steps

**Goal**: Break a route into time-based waypoints using Mapbox Directions

**Tasks**:
- [ ] Integrate Mapbox Directions API
  - Request route between start and destination
  - Get route geometry (polyline) and total duration
- [ ] Implement step calculation algorithm:
  - Given total duration and time step, calculate number of stops
  - Interpolate points along the route geometry at each time interval
  - For each point, reverse geocode to find nearest city/town name
- [ ] Create `RouteSteps` component to display:
  - Ordered list of waypoints
  - City name
  - Time offset from start (e.g., "+0h", "+2h", "+4h")
- [ ] Handle edge cases:
  - Very short routes (fewer steps than expected)
  - Very long routes (many steps)
  - Time step longer than total journey

**Deliverable**: List of cities along route with time offsets

---

## Phase 4: Weather Integration

**Goal**: Show weather forecasts for each waypoint at arrival time

**Tasks**:
- [ ] Integrate Open-Meteo API
  - Fetch hourly forecast for each waypoint's coordinates
  - Get temperature, weather code, precipitation probability
- [ ] Create weather data fetching logic:
  - Batch requests or parallel fetch for all waypoints
  - Map arrival time to correct forecast hour
- [ ] Create `WeatherDisplay` component for each step:
  - Temperature (numeric)
  - Condition icon (sun, clouds, rain, snow, etc.)
  - Precipitation chance (percentage + icon)
- [ ] Implement F/C temperature toggle
  - Store preference in state (later: localStorage)
- [ ] Map Open-Meteo weather codes to appropriate icons
- [ ] Add weather source selector (dropdown, currently just Open-Meteo)
  - Structure for future sources

**Deliverable**: Route list with weather data for each stop

---

## Phase 5: Date/Time Picker & Slider

**Goal**: Control departure time with live-updating weather

**Tasks**:
- [ ] Add date/time picker component
  - Date selection (calendar)
  - Time selection (hour/minute)
  - Default to current date/time
- [ ] Add ±24 hour slider
  - Range: -24 to +24 hours from selected date/time
  - Updates weather in real-time as user drags
  - Show current offset value
- [ ] Optimize for live updates:
  - Debounce or throttle API calls during drag
  - Cache weather data where possible
  - Loading states that don't flash
- [ ] Recalculate all waypoint weather when time changes
- [ ] Display effective departure time prominently

**Deliverable**: Interactive time controls with live weather updates

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

## Questions/Decisions for Later

1. Should the F/C preference persist in localStorage?
2. Icon set preference (custom SVGs, icon library like Lucide, or weather-specific)?
3. Any specific color scheme or branding?
