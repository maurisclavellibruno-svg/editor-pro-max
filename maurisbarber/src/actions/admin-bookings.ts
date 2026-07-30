"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasBookingConflict } from "@/lib/availability";
import { notifications } from "@/lib/notifications";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("No autorizado");
}

const manualBookingSchema = z.object({
  serviceId: z.string().cuid(),
  employeeId: z.string().cuid(),
  startAt: z.string().datetime(),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  phone: z.string().trim().min(6),
  email: z.string().trim().email().optional().or(z.literal("")),
  notes: z.string().trim().optional().default(""),
});

export async function createManualBooking(input: unknown) {
  await requireAdmin();
  const data = manualBookingSchema.parse(input);

  const service = await prisma.service.findUnique({ where: { id: data.serviceId } });
  if (!service) throw new Error("Servicio no encontrado");

  const startAt = new Date(data.startAt);
  const endAt = new Date(startAt.getTime() + service.duration * 60_000);

  const conflict = await hasBookingConflict(data.employeeId, startAt, endAt);
  if (conflict) throw new Error("El barbero ya tiene un turno en ese horario");

  const customer = await prisma.customer.upsert({
    where: { phone: data.phone },
    update: { firstName: data.firstName, lastName: data.lastName, email: data.email || undefined },
    create: {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email || undefined,
    },
  });

  await prisma.booking.create({
    data: {
      customerId: customer.id,
      serviceId: service.id,
      employeeId: data.employeeId,
      startAt,
      endAt,
      price: service.price,
      status: "CONFIRMED",
      notes: data.notes,
    },
  });

  revalidatePath("/admin/agenda");
}

const rescheduleSchema = z.object({
  bookingId: z.string().cuid(),
  startAt: z.string().datetime(),
});

export async function rescheduleBooking(input: unknown) {
  await requireAdmin();
  const data = rescheduleSchema.parse(input);

  const booking = await prisma.booking.findUnique({ where: { id: data.bookingId }, include: { service: true } });
  if (!booking) throw new Error("Turno no encontrado");

  const startAt = new Date(data.startAt);
  const endAt = new Date(startAt.getTime() + booking.service.duration * 60_000);

  const conflict = await hasBookingConflict(booking.employeeId, startAt, endAt, booking.id);
  if (conflict) throw new Error("El barbero ya tiene un turno en ese horario");

  await prisma.booking.update({ where: { id: booking.id }, data: { startAt, endAt } });
  revalidatePath("/admin/agenda");
}

const statusSchema = z.object({
  bookingId: z.string().cuid(),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"]),
});

export async function updateBookingStatus(input: unknown) {
  await requireAdmin();
  const data = statusSchema.parse(input);
  const booking = await prisma.booking.update({
    where: { id: data.bookingId },
    data: { status: data.status },
    include: { customer: true, service: true },
  });

  if (data.status === "CANCELLED") {
    await notifications.notifyCancellation({
      customerName: `${booking.customer.firstName} ${booking.customer.lastName}`,
      customerPhone: booking.customer.phone,
      customerEmail: booking.customer.email,
      serviceName: booking.service.name,
      startAt: booking.startAt,
      price: Number(booking.price),
    });
  }

  revalidatePath("/admin/agenda");
}

const paymentSchema = z.object({
  bookingId: z.string().cuid(),
  paymentStatus: z.enum(["UNPAID", "PAID"]),
  paymentMethod: z.enum(["CASH", "TRANSFER", "MERCADO_PAGO", "DEBIT", "CREDIT"]).optional(),
});

export async function updateBookingPayment(input: unknown) {
  await requireAdmin();
  const data = paymentSchema.parse(input);
  await prisma.booking.update({
    where: { id: data.bookingId },
    data: { paymentStatus: data.paymentStatus, paymentMethod: data.paymentMethod },
  });
  revalidatePath("/admin/agenda");
}
