import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "WeatherRoute - Weather Forecasts Along Your Journey",
  description:
    "Plan your road trip with weather forecasts at every stop. See predicted conditions along your route based on your departure time.",
  keywords: ["weather", "road trip", "route planner", "forecast", "travel"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen font-sans">
        <div className="min-h-screen flex flex-col">
          <header className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <Link href="/" className="text-xl font-semibold text-gray-800 hover:text-gray-600 transition-colors">
                Road Trip Conditions
              </Link>
            </div>
          </header>
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">{children}</div>
          </main>
          <footer className="bg-white border-t border-gray-200 px-4 py-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center text-sm text-gray-500">
              Weather data powered by Open-Meteo
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
