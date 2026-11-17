"use client";

import { getEffectivePrice, type PriceableService } from "@/lib/pricing";
import { whatsappHref, normalizeUyPhone } from "@/lib/whatsapp";
import { trackMetaEvent } from "@/lib/metaPixel";

interface GiftCardService extends PriceableService {
  name: string;
}

export function GiftCards({
  advisoryService,
  cutService,
  whatsappNumber,
}: {
  advisoryService: GiftCardService | null;
  cutService: GiftCardService | null;
  whatsappNumber: string;
}) {
  const cards = [advisoryService, cutService].filter((s): s is GiftCardService => s !== null);
  if (cards.length === 0) return null;

  return (
    <section className="w-full bg-noir-soft px-6 py-16 text-ivory sm:py-24">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-ivory sm:text-4xl">
          ¿No sabés qué regalarle?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-ivory-soft">
          Regalale un cambio que se nota. Te mando la gift card por WhatsApp, lista para regalar. Vale
          por 3 meses.
        </p>

        <div className="mx-auto mt-8 grid max-w-2xl gap-4 sm:grid-cols-2">
          {cards.map((service) => {
            const price = getEffectivePrice(service);
            return (
              <div key={service.name} className="rounded-2xl border border-gold/20 bg-noir p-6">
                <p className="font-display font-semibold text-ivory">Gift card {service.name}</p>
                <p className="mt-2">
                  {price.originalPrice && (
                    <span className="mr-2 text-ivory-soft/60 line-through">${price.originalPrice}</span>
                  )}
                  <span className="font-display text-2xl font-semibold text-gold">${price.price}</span>
                </p>
              </div>
            );
          })}
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
