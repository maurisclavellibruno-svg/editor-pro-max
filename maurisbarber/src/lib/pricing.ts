// Pure pricing logic shared by the landing page, the booking wizard, and
// booking creation — so "what does this service cost today" is computed the
// same way everywhere. No Prisma import here on purpose: this file is safe
// to import from client components.

export interface PriceableService {
  price: number;
  promoPrice: number | null;
  promoStartsAt: Date | null;
  promoEndsAt: Date | null;
  specialPrice: number | null;
  specialDates: string[]; // "YYYY-MM-DD"
}

export interface EffectivePrice {
  price: number;
  // Set when a different, higher price should show struck through above it
  // (either the holiday override or an active promo).
  originalPrice: number | null;
  reason: "special" | "promo" | "none";
}

// `at` defaults to now. Pass a specific Date (e.g. a booking's date) to
// price that day instead of "right now" — e.g. so a booking made in
// November for a December date during the promo window still gets quoted
// the promo price it displayed at booking time... today's call sites all
// use "now", but the date param keeps this honest for that case later.
export function getEffectivePrice(service: PriceableService, at: Date = new Date()): EffectivePrice {
  const dateStr = toMontevideoDateStr(at);

  if (service.specialPrice !== null && service.specialDates.includes(dateStr)) {
    return { price: service.specialPrice, originalPrice: null, reason: "special" };
  }

  if (
    service.promoPrice !== null &&
    service.promoStartsAt &&
    service.promoEndsAt &&
    at >= service.promoStartsAt &&
    at <= service.promoEndsAt
  ) {
    return { price: service.promoPrice, originalPrice: service.price, reason: "promo" };
  }

  return { price: service.price, originalPrice: null, reason: "none" };
}

// Montevideo has no DST and a fixed UTC-3 offset, so this is a plain
// arithmetic shift rather than a full Intl timezone conversion — consistent
// with the rest of the app's date handling (see lib/time.ts).
export function toMontevideoDateStr(date: Date): string {
  const montevideo = new Date(date.getTime() - 3 * 60 * 60 * 1000);
  const y = montevideo.getUTCFullYear();
  const m = String(montevideo.getUTCMonth() + 1).padStart(2, "0");
  const d = String(montevideo.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
