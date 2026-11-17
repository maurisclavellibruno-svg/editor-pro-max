import { Section } from "@/components/ui/Section";
import { normalizeUyPhone } from "@/lib/whatsapp";

const DAY_NAMES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

interface Hours {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

interface HoursAndContactProps {
  hours: Hours[];
  phone: string;
  address: string;
  mapsEmbedUrl: string;
  mapsUrl: string;
}

function todayLabel(hours: Hours[]): string {
  const todayIndex = new Date().getDay();
  const today = hours.find((h) => h.dayOfWeek === todayIndex);
  if (today && !today.isClosed) {
    return `Hoy: abierto de ${today.openTime} a ${today.closeTime}`;
  }

  for (let i = 1; i <= 7; i++) {
    const nextIndex = (todayIndex + i) % 7;
    const next = hours.find((h) => h.dayOfWeek === nextIndex);
    if (next && !next.isClosed) {
      const when = i === 1 ? "mañana" : `el ${DAY_NAMES[nextIndex]}`;
      return `Hoy cerrado · Abrimos ${when} a las ${next.openTime}`;
    }
  }
  return "Hoy cerrado";
}

export function HoursAndContact({ hours, phone, address, mapsEmbedUrl, mapsUrl }: HoursAndContactProps) {
  return (
    <Section id="ubicacion" eyebrow="Visitanos" title="Ubicación y horario">
      <div className="grid gap-8 sm:grid-cols-2">
        <div className="rounded-2xl border border-gold/15 bg-noir-soft p-6">
          <p className="font-display text-lg font-semibold text-gold">{todayLabel(hours)}</p>
          <div className="mt-6 space-y-1 border-t border-gold/15 pt-6 text-sm">
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-ivory hover:text-gold">
              {address}
            </a>
            <p className="text-ivory-soft">Apto. 002 — tocá timbre y te abro.</p>
            <a href={`tel:+${normalizeUyPhone(phone)}`} className="mt-2 block text-ivory-soft hover:text-gold">
              Tel: {phone}
            </a>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-gold/15">
          <iframe
            src={mapsEmbedUrl}
            className="h-full min-h-[320px] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Ubicación de MaurisBarber"
          />
        </div>
      </div>
    </Section>
  );
}
