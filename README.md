# WeatherRoute

A web app that shows weather forecasts along a driving route, broken into time-based steps.

## Features

- Enter start and destination cities with autocomplete
- Break your journey into time-based steps (e.g., every 2 hours)
- See weather forecasts for each waypoint based on arrival time
- Adjust departure time with a date picker and ±24 hour slider
- Toggle between Fahrenheit and Celsius
- Share routes via URL

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing/Geocoding**: Mapbox
- **Weather**: Open-Meteo (free, no API key required)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Mapbox account (for geocoding and directions)

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local` and add your Mapbox token:
   ```bash
   cp .env.example .env.local
   ```
4. Get a Mapbox token at https://account.mapbox.com/access-tokens/
5. Run the development server:
   ```bash
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000)

## Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/andrewgrant/WeatherRoute)

Or connect your GitHub repository to Vercel and it will auto-deploy on push.

**Environment Variables for Production:**
- `NEXT_PUBLIC_MAPBOX_TOKEN` - Your Mapbox public token

## License

MIT
