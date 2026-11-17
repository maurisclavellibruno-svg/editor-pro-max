"use client";

import { useState } from "react";
import Link from "next/link";
import { getEffectivePrice, type PriceableService } from "@/lib/pricing";

export interface PreviewService extends PriceableService {
  id: string;
  slug: string | null;
  name: string;
  description: string;
  duration: number;
  featured: boolean;
  badge: string | null;
  category: string;
}

function reservarHref(slug: string | null, utm?: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  if (slug) params.set("servicio", slug);
  if (utm?.source) params.set("utm_source", utm.source);
  if (utm?.campaign) params.set("utm_campaign", utm.campaign);
  if (utm?.content) params.set("utm_content", utm.content);
  const qs = params.toString();
  return qs ? `/reservar?${qs}` : "/reservar";
}

function PriceTag({ service }: { service: PriceableService }) {
  const price = getEffectivePrice(service);
  return (
    <div className="shrink-0 text-right">
      {price.originalPrice && <p className="text-xs text-ivory-soft/60 line-through">${price.originalPrice}</p>}
      <p className="font-display text-lg font-semibold text-gold">${price.price}</p>
    </div>
  );
}

export function ServicesPreview({
  services,
  utm,
}: {
  services: PreviewService[];
  utm?: Record<string, string | undefined>;
}) {
  const featured = services.find((s) => s.featured);
  const general = services.filter((s) => !s.featured && s.category !== "color");
  const colorGroup = services.filter((s) => s.category === "color");
  const [colorOpen, setColorOpen] = useState(false);

  return (
    <section id="servicios" className="w-full bg-noir px-6 py-16 text-ivory sm:py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-display text-center text-3xl font-semibold tracking-tight text-ivory sm:text-4xl">
          Elegí qué necesitás
        </h2>

        {featured && (
          <div className="mt-8 rounded-3xl border border-gold/30 bg-noir-soft p-6 sm:p-8">
            <span className="inline-block rounded-full bg-gold px-3 py-1 text-xs font-semibold text-noir">
              {featured.badge ?? "El más elegido"}
            </span>
            <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl font-semibold text-ivory">{featured.name}</h3>
                <p className="mt-1 text-sm text-ivory-soft">{featured.duration} min</p>
              </div>
              <PriceTag service={featured} />
            </div>
            <p className="mt-4 text-ivory-soft">{featured.description}</p>
            <ul className="mt-4 space-y-1.5 text-sm text-ivory-soft">
              <li>✓ Análisis de tu cara y tu estilo</li>
              <li>✓ El corte en el momento</li>
              <li>✓ PDF con cómo peinarte y qué productos usar</li>
            </ul>
            <Link
              href={reservarHref(featured.slug, utm)}
              className="mt-6 flex h-14 w-full items-center justify-center rounded-full bg-gold text-lg font-medium text-noir shadow-gold transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Reservar asesoría
            </Link>
            <p className="mt-2 text-center text-xs text-ivory-soft/70">Reservás en 1 minuto · Sin crear cuenta</p>
          </div>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {general.map((service) => (
            <div key={service.id} className="flex flex-col rounded-2xl border border-gold/15 bg-noir-soft p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-base font-semibold text-ivory">{service.name}</h3>
                <PriceTag service={service} />
              </div>
              <p className="mt-1 text-xs text-ivory-soft">{service.duration} min</p>
              <p className="mt-2 flex-1 text-sm text-ivory-soft">{service.description}</p>
              <Link
                href={reservarHref(service.slug, utm)}
                className="mt-4 flex h-11 items-center justify-center rounded-full border border-gold/40 text-sm font-medium text-gold transition-colors hover:border-gold hover:bg-gold/10"
              >
                Reservar
              </Link>
            </div>
          ))}
        </div>

        {colorGroup.length > 0 && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-gold/15 bg-noir-soft">
            <button
              type="button"
              onClick={() => setColorOpen((v) => !v)}
              className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
              <span className="font-display font-semibold text-ivory">Color</span>
              <span className={`text-gold transition-transform ${colorOpen ? "rotate-45" : ""}`}>+</span>
            </button>
            {colorOpen && (
              <div className="divide-y divide-gold/10 border-t border-gold/10">
                {colorGroup.map((service) => (
                  <div key={service.id} className="flex items-start justify-between gap-4 px-5 py-4">
                    <div>
                      <p className="font-medium text-ivory">{service.name}</p>
                      <p className="text-xs text-ivory-soft">{service.duration} min</p>
                      <p className="mt-1 text-sm text-ivory-soft">{service.description}</p>
                      <Link
                        href={reservarHref(service.slug, utm)}
                        className="mt-2 inline-block text-sm font-medium text-gold hover:underline"
                      >
                        Reservar
                      </Link>
                    </div>
                    <PriceTag service={service} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
