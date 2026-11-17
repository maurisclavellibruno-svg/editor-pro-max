import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/availability";
import { isRateLimited } from "@/lib/rate-limit";
import { z } from "zod";

const querySchema = z.object({
  serviceId: z.string().cuid(),
  employeeId: z.string().cuid().optional().or(z.literal("")),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  days: z.coerce.number().int().min(1).max(60).default(21),
});

// Bulk version of /api/disponibilidad — tells the date picker which of the
// next N days have zero bookable slots (closed day, fully booked, or
// outside business hours), so those days can be grayed out up front instead
// of the customer tapping one and finding out on the next screen.
export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(`disponibilidad-dias:${ip}`, 30, 60 * 1000)) {
    return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    serviceId: searchParams.get("serviceId"),
    employeeId: searchParams.get("employeeId") ?? undefined,
    from: searchParams.get("from"),
    days: searchParams.get("days") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }
  const { serviceId, employeeId, from, days } = parsed.data;

  const [year, month, day] = from.split("-").map(Number);
  const unavailable: string[] = [];

  for (let i = 0; i < days; i++) {
    const d = new Date(year, month - 1, day + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const slots = await getAvailableSlots({ serviceId, date: dateStr, employeeId: employeeId || undefined });
    if (slots.length === 0) unavailable.push(dateStr);
  }

  return NextResponse.json({ unavailable });
}
