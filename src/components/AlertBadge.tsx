"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, X } from "lucide-react";
import { WeatherAlert } from "@/lib/types";
import { getAlertSeverityColor, getAlertIconColor } from "@/lib/alerts";

interface AlertBadgeProps {
  alerts: WeatherAlert[];
  tripStartTime?: Date;
}

export function AlertBadge({ alerts, tripStartTime }: AlertBadgeProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!alerts || alerts.length === 0) return null;

  // Filter alerts: only show those that expire after trip start time
  const relevantAlerts = tripStartTime
    ? alerts.filter((alert) => alert.expires > tripStartTime)
    : alerts;

  if (relevantAlerts.length === 0) return null;

  // Get the most severe alert for the badge color
  const mostSevere = relevantAlerts[0];
  const iconColor = getAlertIconColor(mostSevere.severity);

  return (
    <div className="mt-2">
      {/* Collapsed badge */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border transition-colors ${getAlertSeverityColor(mostSevere.severity)} hover:opacity-80`}
        aria-expanded={isExpanded}
        aria-label={`${relevantAlerts.length} weather ${relevantAlerts.length === 1 ? "alert" : "alerts"}`}
      >
        <AlertTriangle className={`h-3.5 w-3.5 ${iconColor}`} />
        <span>
          {relevantAlerts.length} {relevantAlerts.length === 1 ? "Alert" : "Alerts"}
        </span>
        {isExpanded ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </button>

      {/* Expanded alert details */}
      {isExpanded && (
        <div className="mt-2 space-y-2">
          {relevantAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </div>
  );
}

interface AlertCardProps {
  alert: WeatherAlert;
}

function AlertCard({ alert }: AlertCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const colorClass = getAlertSeverityColor(alert.severity);
  const iconColor = getAlertIconColor(alert.severity);

  const formatExpiry = (date: Date) => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 24) {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    }
    if (diffHours > 0) {
      return `Expires in ${diffHours}h ${diffMins}m`;
    }
    return `Expires in ${diffMins}m`;
  };

  return (
    <div className={`rounded-lg border p-3 ${colorClass}`}>
      <div className="flex items-start gap-2">
        <AlertTriangle className={`h-4 w-4 flex-shrink-0 mt-0.5 ${iconColor}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium text-sm">{alert.event}</p>
              <p className="text-xs opacity-75 mt-0.5">
                {formatExpiry(alert.expires)}
              </p>
            </div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs underline opacity-75 hover:opacity-100 flex-shrink-0"
            >
              {showDetails ? "Less" : "More"}
            </button>
          </div>

          {showDetails && (
            <div className="mt-2 space-y-2 text-xs">
              <p className="font-medium">{alert.headline}</p>
              {alert.instruction && (
                <div className="p-2 bg-white/50 rounded">
                  <p className="font-medium mb-1">Instructions:</p>
                  <p className="whitespace-pre-wrap">{alert.instruction}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
