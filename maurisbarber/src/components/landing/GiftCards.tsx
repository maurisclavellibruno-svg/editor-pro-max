"use client";

import { whatsappHref, normalizeUyPhone } from "@/lib/whatsapp";
import { trackMetaEvent } from "@/lib/metaPixel";

const EXAMPLE_AMOUNTS = ["$500", "$1.000", "$1.500", "El monto que quieras"];

// Open-amount gift card — not tied to a specific service or price. Mauris
// and the buyer agree the amount over WhatsApp; it can go toward any
// service (fully or partially — the recipient tops up the difference if it
// doesn't cover the full price). See the GiftCard/CustomerMembership models
// in the admin for how it's redeemed.
export function GiftCards({ whatsappNumber }: { whatsappNumber: string }) {
  return (
    <section className="w-full bg-noir-soft px-6 py-16 text-ivory sm:py-24">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-ivory sm:text-4xl">
          ¿No sabés qué regalarle a tu novio, hijo o nieto?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-ivory-soft">
          Una gift card. Vos elegís el monto. Vale para cualquier corte, asesoría o lo que él quiera — si
          no le alcanza para todo, paga la diferencia. Te la mando por WhatsApp, lista para regalar. Vale
          por 3 meses.
        </p>

        <div className="mx-auto mt-8 flex max-w-xl flex-wrap justify-center gap-2">
          {EXAMPLE_AMOUNTS.map((amount) => (
            <span
              key={amount}
              className="rounded-full border border-gold/20 bg-noir px-4 py-2 text-sm text-ivory-soft"
            >
              {amount}
            </span>
          ))}
        </div>

        <a
          href={whatsappHref(normalizeUyPhone(whatsappNumber), "Hola, quiero una gift card")}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackMetaEvent("Contact")}
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-gold px-8 text-sm font-medium text-noir transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Quiero una gift card
        </a>
      </div>
    </section>
  );
}
