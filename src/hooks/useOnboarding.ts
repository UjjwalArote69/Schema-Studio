/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "schema-studio-onboarding-v1";

interface OnboardingState {
  /** Whether the welcome tour has been completed or dismissed */
  tourCompleted: boolean;
  /** Timestamp of when the tour was completed */
  completedAt: number | null;
}

const DEFAULT_STATE: OnboardingState = {
  tourCompleted: false,
  completedAt: null,
};

function readState(): OnboardingState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

function writeState(state: OnboardingState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable (private browsing, quota, etc.) — fail silently
  }
}

/**
 * Manages onboarding tour visibility.
 *
 * - `showTour` is true on first visit (localStorage empty)
 * - `completeTour()` marks it done so it never auto-shows again
 * - `replayTour()` re-opens the tour on demand (e.g. from a help button)
 */
export function useOnboarding() {
  const [showTour, setShowTour] = useState(false);
  const [ready, setReady] = useState(false);

  // Read persisted state after mount (SSR-safe)
  useEffect(() => {
    const persisted = readState();
    if (!persisted.tourCompleted) {
      setShowTour(true);
    }
    setReady(true);
  }, []);

  const completeTour = useCallback(() => {
    setShowTour(false);
    writeState({ tourCompleted: true, completedAt: Date.now() });
  }, []);

  const replayTour = useCallback(() => {
    setShowTour(true);
  }, []);

  return { showTour, ready, completeTour, replayTour };
}