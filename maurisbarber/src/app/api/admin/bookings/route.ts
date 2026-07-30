import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const employeeId = searchParams.get("employeeId");

  const bookings = await prisma.booking.findMany({
    where: {
      ...(start && end ? { startAt: { lt: new Date(end) }, endAt: { gt: new Date(start) } } : {}),
      ...(employeeId ? { employeeId } : {}),
    },
    include: { service: true, customer: true, employee: true },
    orderBy: { startAt: "asc" },
  });

  const events = bookings.map((b) => ({
    id: b.id,
    title: `${b.customer.firstName} ${b.customer.lastName} · ${b.service.name}${
      !employeeId ? ` (${b.employee.name})` : ""
    }`,
    start: b.startAt.toISOString(),
    end: b.endAt.toISOString(),
    backgroundColor: STATUS_COLORS[b.status] ?? b.service.color,
    borderColor: b.service.color,
    extendedProps: {
      status: b.status,
      paymentStatus: b.paymentStatus,
      paymentMethod: b.paymentMethod,
      serviceId: b.serviceId,
      serviceName: b.service.name,
      price: Number(b.price),
      customerName: `${b.customer.firstName} ${b.customer.lastName}`,
      customerPhone: b.customer.phone,
      notes: b.notes,
    },
  }));

  return NextResponse.json({ events });
}

const STATUS_COLORS: Record<string, string> = {
  CANCELLED: "#9ca3af",
  NO_SHOW: "#ef4444",
  COMPLETED: "#16a34a",
};
