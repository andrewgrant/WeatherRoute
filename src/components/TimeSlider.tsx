"use client";

import { useCallback, useRef } from "react";
import { Clock, Minus, Plus } from "lucide-react";

interface TimeSliderProps {
  baseTime: Date;
  offsetHours: number;
  onChange: (offsetHours: number) => void;
  disabled?: boolean;
}

export function TimeSlider({
  baseTime,
  offsetHours,
  onChange,
  disabled = false,
}: TimeSliderProps) {
  const sliderRef = useRef<HTMLInputElement>(null);

  const effectiveTime = new Date(
    baseTime.getTime() + offsetHours * 60 * 60 * 1000
  );

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(parseFloat(e.target.value));
    },
    [onChange]
  );

  const handleQuickAdjust = useCallback(
    (delta: number) => {
      const newOffset = Math.max(-36, Math.min(36, offsetHours + delta));
      onChange(newOffset);
    },
    [offsetHours, onChange]
  );

  const formatOffset = (hours: number): string => {
    if (hours === 0) return "Now";
    const sign = hours > 0 ? "+" : "";
    const absHours = Math.abs(hours);
    if (absHours < 1) {
      return `${sign}${Math.round(hours * 60)}m`;
    }
    const h = Math.floor(absHours);
    const m = Math.round((absHours - h) * 60);
    if (m === 0) return `${sign}${h}h`;
    return `${sign}${h}h ${m}m`;
  };

  const formatEffectiveTime = (date: Date): string => {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    if (isToday) return `Today at ${timeStr}`;
    if (isTomorrow) return `Tomorrow at ${timeStr}`;
    if (isYesterday) return `Yesterday at ${timeStr}`;

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-3">
      {/* Effective time display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">
            Departure Time
          </span>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-800">
            {formatEffectiveTime(effectiveTime)}
          </p>
          <p className="text-xs text-gray-500">{formatOffset(offsetHours)}</p>
        </div>
      </div>

      {/* Slider with controls */}
      <div className="flex items-center gap-3">
        {/* Minus button */}
        <button
          type="button"
          onClick={() => handleQuickAdjust(-1)}
          disabled={disabled || offsetHours <= -36}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Subtract 1 hour"
        >
          <Minus className="h-4 w-4" />
        </button>

        {/* Slider */}
        <div className="flex-1 relative">
          <input
            ref={sliderRef}
            type="range"
            min="-36"
            max="36"
            step="1"
            value={offsetHours}
            onChange={handleSliderChange}
            disabled={disabled}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-blue-500
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:shadow-md
              [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:hover:scale-110
              [&::-moz-range-thumb]:w-4
              [&::-moz-range-thumb]:h-4
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-blue-500
              [&::-moz-range-thumb]:border-0
              [&::-moz-range-thumb]:cursor-pointer
              [&::-moz-range-thumb]:shadow-md"
          />
          {/* Center marker */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-3 bg-gray-300 pointer-events-none" />
        </div>

        {/* Plus button */}
        <button
          type="button"
          onClick={() => handleQuickAdjust(1)}
          disabled={disabled || offsetHours >= 36}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Add 1 hour"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Scale labels */}
      <div className="flex justify-between text-xs text-gray-400 px-8">
        <span>-36h</span>
        <span>Now</span>
        <span>+36h</span>
      </div>
    </div>
  );
}
