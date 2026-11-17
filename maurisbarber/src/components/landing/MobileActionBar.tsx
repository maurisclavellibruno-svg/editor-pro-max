"use client";

import { whatsappHref, normalizeUyPhone } from "@/lib/whatsapp";
import { trackMetaEvent } from "@/lib/metaPixel";

// Mobile-only (replaces the floating WhatsApp bubble there — see
// WhatsAppButton, which stays for desktop). Three equal-height buttons so
// "Reservar" reads as the one that matters without the others disappearing.
export function MobileActionBar({ whatsappNumber, mapsUrl }: { whatsappNumber: string; mapsUrl: string }) {
  return (
    <div className="theme-dark fixed inset-x-0 bottom-0 z-40 flex border-t border-gold/15 bg-noir/95 backdrop-blur sm:hidden">
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-1 flex-col items-center justify-center gap-0.5 border-r border-gold/10 py-3 text-xs font-medium text-ivory-soft"
      >
        <span aria-hidden>📍</span>
        Cómo llegar
      </a>
      <a
        href={whatsappHref(normalizeUyPhone(whatsappNumber), "Hola, quiero más información.")}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackMetaEvent("Contact")}
        className="flex flex-1 flex-col items-center justify-center gap-0.5 border-r border-gold/10 py-3 text-xs font-medium text-ivory-soft"
      >
        <span aria-hidden>💬</span>
        WhatsApp
      </a>
      <a
        href="#servicios"
        className="flex flex-1 items-center justify-center bg-gold text-sm font-semibold text-noir"
      >
        Reservar
      </a>
    </div>
  );
}
