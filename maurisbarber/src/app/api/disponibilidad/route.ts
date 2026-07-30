import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/availability";
import { availabilityQuerySchema } from "@/schemas/booking";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = availabilityQuerySchema.safeParse({
    serviceId: searchParams.get("serviceId"),
    date: searchParams.get("date"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  const slots = await getAvailableSlots(parsed.data);
  return NextResponse.json({ slots });
}
