"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serviceSchema } from "@/schemas/service";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("No autorizado");
}

export async function upsertService(input: unknown) {
  await requireAdmin();
  const data = serviceSchema.parse(input);

  const payload = {
    name: data.name,
    description: data.description ?? "",
    price: data.price,
    duration: data.duration,
    color: data.color,
    imageUrl: data.imageUrl || null,
    active: data.active,
    schedulingMode: data.schedulingMode,
    frequencyMinutes: data.schedulingMode === "CUSTOM_FREQUENCY" ? data.frequencyMinutes : null,
    manualSlots: data.schedulingMode === "MANUAL" ? data.manualSlots : [],
    allowsParallel: data.allowsParallel,
  };

  if (data.id) {
    await prisma.service.update({ where: { id: data.id }, data: payload });
  } else {
    await prisma.service.create({ data: payload });
  }

  revalidatePath("/admin/servicios");
  revalidatePath("/");
}

export async function deleteService(id: string) {
  await requireAdmin();
  const bookingCount = await prisma.booking.count({ where: { serviceId: id } });
  if (bookingCount > 0) {
    // Preserve booking history: services with past bookings are deactivated,
    // never hard-deleted.
    await prisma.service.update({ where: { id }, data: { active: false } });
  } else {
    await prisma.service.delete({ where: { id } });
  }
  revalidatePath("/admin/servicios");
  revalidatePath("/");
}
