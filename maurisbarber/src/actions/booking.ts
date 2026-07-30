"use server";

import { prisma } from "@/lib/prisma";
import { isSlotAvailable } from "@/lib/availability";
import { notifications } from "@/lib/notifications";
import { createBookingSchema } from "@/schemas/booking";
import { dateWithMinutes, timeToMinutes } from "@/lib/time";

export interface CreateBookingResult {
  ok: boolean;
  error?: string;
  bookingId?: string;
}

export async function createBooking(formData: FormData): Promise<CreateBookingResult> {
  const raw = {
    serviceId: formData.get("serviceId"),
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

  const employee = await prisma.employee.findFirst({ where: { active: true } });
  if (!employee) {
    return { ok: false, error: "No hay barberos disponibles en este momento" };
  }

  const available = await isSlotAvailable({
    serviceId: data.serviceId,
    date: data.date,
    time: data.time,
    employeeId: employee.id,
  });
  if (!available) {
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
      employeeId: employee.id,
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

  return { ok: true, bookingId: booking.id };
}
