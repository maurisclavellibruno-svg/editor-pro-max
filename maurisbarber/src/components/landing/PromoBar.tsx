import { toMontevideoDateStr } from "@/lib/pricing";

// Configurable here — matches the service promo window (lib/pricing.ts uses
// real DateTimes for pricing; this bar just needs the calendar-day range).
const FIESTAS_START = "2026-12-01";
const FIESTAS_END = "2026-12-20";
const REYES_START = "2026-12-21";
const REYES_END = "2027-01-06";

export function PromoBar() {
  const today = toMontevideoDateStr(new Date());

  let message: string | null = null;
  if (today >= FIESTAS_START && today <= FIESTAS_END) {
    message = "🎁 Fiestas: 10% off en asesorías y cortes hasta el 20/12 · Gift cards disponibles";
  } else if (today >= REYES_START && today <= REYES_END) {
    message = "🎁 Gift cards para Reyes · Agenda de fiestas abierta";
  }

  if (!message) return null;

  return (
    <div className="w-full bg-gold px-4 py-2 text-center text-xs font-medium text-noir sm:text-sm">
      {message}
    </div>
  );
}
