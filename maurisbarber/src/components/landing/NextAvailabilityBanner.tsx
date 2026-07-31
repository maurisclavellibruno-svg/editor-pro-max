import Link from "next/link";
import { getNextAvailableSlot } from "@/lib/availability";

const WEEKDAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

function formatSlot(dateStr: string, time: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  const today = new Date();
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
  const isTomorrow =
    date.getFullYear() === tomorrow.getFullYear() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getDate() === tomorrow.getDate();

  const when = isToday ? "hoy" : isTomorrow ? "mañana" : `el ${WEEKDAYS[date.getDay()]} ${day}`;
  return `${when} a las ${time}`;
}

// Shows the soonest real open slot from the availability engine — no
// fabricated numbers, just an actual bookable time.
export async function NextAvailabilityBanner() {
  const next = await getNextAvailableSlot();
  if (!next) return null;

  return (
    <Link
      href="/reservar"
      className="flex items-center justify-center gap-2 border-y border-line bg-accent/10 px-6 py-3 text-center text-sm font-medium text-accent-hover transition-colors hover:bg-accent/15"
    >
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
      </span>
      Próximo turno disponible: {formatSlot(next.date, next.time)}
    </Link>
  );
}
