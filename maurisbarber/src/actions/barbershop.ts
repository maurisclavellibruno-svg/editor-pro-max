"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { barbershopSettingsSchema } from "@/schemas/barbershop";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("No autorizado");
}

// Single-row table (see schema.prisma) — same upsert-by-findFirst pattern
// seed.ts uses, so this works whether or not a row already exists.
export async function updateBarbershopSettings(input: unknown) {
  await requireAdmin();
  const data = barbershopSettingsSchema.parse(input);

  const existing = await prisma.barbershop.findFirst();
  if (existing) {
    await prisma.barbershop.update({ where: { id: existing.id }, data: { ...data, description: data.description || "" } });
  } else {
    await prisma.barbershop.create({ data: { ...data, description: data.description || "" } });
  }

  revalidatePath("/");
  revalidatePath("/admin/configuracion");
}
