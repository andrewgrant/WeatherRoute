import { MapPin } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
          <MapPin className="w-8 h-8 text-blue-500" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Plan Your Weather-Aware Journey
        </h2>
        <p className="text-gray-500 max-w-md mx-auto">
          Enter your starting point and destination to see weather forecasts at
          every stop along the way.
        </p>
      </div>

      {/* Route form will be added in Phase 2 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <p className="text-gray-400 text-center text-sm">
          Route planning coming soon
        </p>
      </div>
    </div>
  );
}
