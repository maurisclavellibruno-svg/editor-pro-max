"use client";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

// No-op until NEXT_PUBLIC_META_PIXEL_ID is set (see components/MetaPixel.tsx)
// — safe to call from anywhere without checking first.
export function trackMetaEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  window.fbq("track", event, params);
}
