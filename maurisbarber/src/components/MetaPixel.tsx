"use client";

import Script from "next/script";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// No-op entirely until NEXT_PUBLIC_META_PIXEL_ID is set — same "optional
// integration" convention as the rest of the app (Mercado Pago, Stripe,
// Google Calendar). Fires PageView on first load and again on every
// client-side route change (App Router navigations don't reload the page,
// so a route-change effect is needed in addition to the base script's
// initial PageView).
export function MetaPixel() {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pixelId || typeof window.fbq !== "function") return;
    window.fbq("track", "PageView");
    // Re-fire on every route change, including query-string-only changes
    // (e.g. /reservar?servicio=corte vs /reservar).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pixelId, pathname, searchParams?.toString()]);

  if (!pixelId) return null;

  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`
        !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
        n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
        document,'script','https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelId}');
        fbq('track', 'PageView');
      `}
    </Script>
  );
}
