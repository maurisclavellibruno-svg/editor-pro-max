"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { blockedDateSchema, breakTimeSchema, businessHoursSchema } from "@/schemas/service";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("No autorizado");
}

export async function upsertBusinessHours(input: unknown) {
  await requireAdmin();
  const data = businessHoursSchema.parse(input);
  await prisma.businessHours.upsert({
    where: { dayOfWeek: data.dayOfWeek },
    update: data,
    create: data,
  });
  revalidatePath("/admin/horarios");
}

export async function upsertBreakTime(input: unknown) {
  await requireAdmin();
  const data = breakTimeSchema.parse(input);
  if (data.id) {
    await prisma.breakTime.update({ where: { id: data.id }, data });
  } else {
    await prisma.breakTime.create({ data });
  }
  revalidatePath("/admin/horarios");
}

export async function deleteBreakTime(id: string) {
  await requireAdmin();
  await prisma.breakTime.delete({ where: { id } });
  revalidatePath("/admin/horarios");
}

export async function upsertBlockedDate(input: unknown) {
  await requireAdmin();
  const data = blockedDateSchema.parse(input);
  const payload = {
    startDate: new Date(data.startDate + "T00:00:00"),
    endDate: new Date(data.endDate + "T23:59:59"),
    reason: data.reason,
    type: data.type,
  };
  if (data.id) {
    await prisma.blockedDate.update({ where: { id: data.id }, data: payload });
  } else {
    await prisma.blockedDate.create({ data: payload });
  }
  revalidatePath("/admin/horarios");
}

export async function deleteBlockedDate(id: string) {
  await requireAdmin();
  await prisma.blockedDate.delete({ where: { id } });
  revalidatePath("/admin/horarios");
}
