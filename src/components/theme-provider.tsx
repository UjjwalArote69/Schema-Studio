"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// --- WORKAROUND FOR REACT 19 / NEXT.JS ---
// next-themes injects a script tag to prevent screen flashing.
// React 19 complains about this in development, causing a red error overlay.
// This safely intercepts and silences that specific false-positive warning.
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Encountered a script tag while rendering React component")
    ) {
      return; // Ignore this specific error
    }
    originalError.apply(console, args); // Log all other errors normally
  };
}

export function ThemeProvider({ 
  children, 
  ...props 
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}