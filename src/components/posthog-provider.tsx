// ============================================================
// FILE: src/components/posthog-provider.tsx
// (Replaces your existing posthog-provider.tsx)
// ============================================================

"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useSearchParams } from "next/navigation";

function PostHogInit() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;

    const key = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
    if (!key) {
      console.warn("[PostHog] Missing NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN");
      return;
    }

    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
      capture_pageview: false,
      capture_pageleave: true,
      loaded: (ph) => {
        console.log("[PostHog] Loaded successfully");
        if (process.env.NODE_ENV === "development") {
          ph.debug();
        }
      },
    });

    initialized.current = true;
  }, []);

  return null;
}

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && posthog.__loaded) {
      let url = window.origin + pathname;
      if (searchParams?.toString()) {
        url = url + "?" + searchParams.toString();
      }
      posthog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams]);

  return null;
}

function PostHogIdentify() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id && posthog.__loaded) {
      posthog.identify(session.user.id, {
        email: session.user.email || undefined,
        name: session.user.name || undefined,
      });
    }
  }, [session]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider client={posthog}>
      <PostHogInit />
      <PostHogPageView />
      <PostHogIdentify />
      {children}
    </PHProvider>
  );
}