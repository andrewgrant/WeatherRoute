"use client";

import { useCallback, useSyncExternalStore } from "react";
import { TemperatureUnit } from "./types";

const STORAGE_KEY = "roadtripconditions-temp-unit";

function getSnapshot(): TemperatureUnit {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "celsius" || stored === "fahrenheit") {
    return stored;
  }
  return "fahrenheit";
}

function getServerSnapshot(): TemperatureUnit {
  return "fahrenheit";
}

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function useTemperatureUnit() {
  const unit = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setUnit = useCallback((newUnit: TemperatureUnit) => {
    localStorage.setItem(STORAGE_KEY, newUnit);
    // Dispatch a storage event to trigger re-render
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
  }, []);

  // isLoaded is always true on client after hydration
  const isLoaded = typeof window !== "undefined";

  return { unit, setUnit, isLoaded };
}
