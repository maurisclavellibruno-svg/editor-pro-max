"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { pickAvailableEmployee } from "@/lib/availability";
import { notifications } from "@/lib/notifications";
import { createBookingSchema } from "@/schemas/booking";
import { dateWithMinutes, timeToMinutes } from "@/lib/time";
import { isRateLimited } from "@/lib/rate-limit";
import { syncBookingBestEffort } from "@/lib/calendar-sync";

export interface CreateBookingResult {
  ok: boolean;
  error?: string;
  bookingId?: string;
}

export async function createBooking(formData: FormData): Promise<CreateBookingResult> {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(`booking:${ip}`, 5, 10 * 60 * 1000)) {
    return { ok: false, error: "Demasiados intentos. Probá de nuevo en unos minutos." };
  }

  const raw = {
    serviceId: formData.get("serviceId"),
    employeeId: formData.get("employeeId"),
    date: formData.get("date"),
    time: formData.get("time"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
  };

  const parsed = createBookingSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const data = parsed.data;

  const service = await prisma.service.findUnique({ where: { id: data.serviceId } });
  if (!service || !service.active) {
    return { ok: false, error: "El servicio seleccionado no está disponible" };
  }

  const employeeId = await pickAvailableEmployee({
    serviceId: data.serviceId,
    date: data.date,
    time: data.time,
    employeeId: data.employeeId || undefined,
  });
  if (!employeeId) {
    return { ok: false, error: "Ese horario ya no está disponible. Elegí otro." };
  }

  const startAt = dateWithMinutes(data.date, timeToMinutes(data.time));
  const endAt = dateWithMinutes(data.date, timeToMinutes(data.time) + service.duration);

  const customer = await prisma.customer.upsert({
    where: { phone: data.phone },
    update: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || undefined,
    },
    create: {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email || undefined,
    },
  });

  const booking = await prisma.booking.create({
    data: {
      customerId: customer.id,
      serviceId: service.id,
      employeeId,
      startAt,
      endAt,
      price: service.price,
      status: "PENDING",
    },
  });

  const payload = {
    customerName: `${data.firstName} ${data.lastName}`,
    customerPhone: data.phone,
    customerEmail: data.email || null,
    serviceName: service.name,
    startAt,
    price: Number(service.price),
  };
  await notifications.notifyAdminNewBooking(payload);
  await notifications.notifyCustomerConfirmation(payload);
  await syncBookingBestEffort(`${service.name} — ${payload.customerName}`, `Tel: ${data.phone}`, startAt, endAt);

  return { ok: true, bookingId: booking.id };
}
