import { Section } from "@/components/ui/Section";

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

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
}

export function HoursAndContact({ hours, phone, address, mapsEmbedUrl }: HoursAndContactProps) {
  return (
    <Section id="ubicacion" eyebrow="Visitanos" title="Horarios y ubicación">
      <div className="grid gap-8 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-muted">
            Horarios
          </h3>
          <ul className="space-y-2">
            {hours.map((h) => (
              <li key={h.dayOfWeek} className="flex justify-between text-sm">
                <span className="text-ink-soft">{DAY_NAMES[h.dayOfWeek]}</span>
                <span className="font-medium text-ink">
                  {h.isClosed ? "Cerrado" : `${h.openTime} – ${h.closeTime}`}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6 space-y-1 border-t border-line pt-6 text-sm">
            <p className="font-medium text-ink">{address}</p>
            <p className="text-ink-muted">Tel: {phone}</p>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-line shadow-card">
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
