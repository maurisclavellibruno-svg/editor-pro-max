import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/availability";
import { availabilityQuerySchema } from "@/schemas/booking";
import { isRateLimited } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(`disponibilidad:${ip}`, 60, 60 * 1000)) {
    return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = availabilityQuerySchema.safeParse({
    serviceId: searchParams.get("serviceId"),
    date: searchParams.get("date"),
    employeeId: searchParams.get("employeeId") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  const slots = await getAvailableSlots({
    ...parsed.data,
    employeeId: parsed.data.employeeId || undefined,
  });
  return NextResponse.json({ slots });
}
