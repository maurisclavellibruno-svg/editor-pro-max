"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/rate-limit";
import { LOYALTY_CARD_GOAL } from "@/lib/loyaltyCard";
import { joinLoyaltyCardSchema } from "@/schemas/loyaltyCard";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("No autorizado");
}

export interface JoinLoyaltyCardResult {
  ok: boolean;
  error?: string;
}

// Public — called from the /fidelidad sign-up form. Same upsert-by-phone
// convention as createBooking, so a customer who already booked before (or
// books later) with the same phone merges into one Customer record instead
// of creating a duplicate.
export async function joinLoyaltyCard(formData: FormData): Promise<JoinLoyaltyCardResult> {
  if (isRateLimited(`loyalty-join:${formData.get("phone")}`, 5, 10 * 60 * 1000)) {
    return { ok: false, error: "Demasiados intentos. Probá de nuevo en unos minutos." };
  }

  const parsed = joinLoyaltyCardSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const data = parsed.data;

  await prisma.customer.upsert({
    where: { phone: data.phone },
    update: { firstName: data.firstName, lastName: data.lastName, loyaltyCardEnrolled: true },
    create: { firstName: data.firstName, lastName: data.lastName, phone: data.phone, loyaltyCardEnrolled: true },
  });

  return { ok: true };
}

const customerIdSchema = z.string().cuid();

// Admin — enroll someone who asks in person, without going through the
// public form.
export async function enrollInLoyaltyCard(customerId: string) {
  await requireAdmin();
  const id = customerIdSchema.parse(customerId);
  await prisma.customer.update({ where: { id }, data: { loyaltyCardEnrolled: true } });
  revalidatePath(`/admin/clientes/${id}`);
  revalidatePath("/admin/fidelidad");
}

export async function addLoyaltyStamp(customerId: string) {
  await requireAdmin();
  const id = customerIdSchema.parse(customerId);
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) throw new Error("Cliente no encontrado");
  if (customer.loyaltyCardStamps >= LOYALTY_CARD_GOAL) {
    throw new Error("Ya tiene el corte gratis disponible — canjealo antes de sumar otro sello");
  }
  await prisma.customer.update({ where: { id }, data: { loyaltyCardStamps: { increment: 1 } } });
  revalidatePath(`/admin/clientes/${id}`);
  revalidatePath("/admin/fidelidad");
}

export async function removeLoyaltyStamp(customerId: string) {
  await requireAdmin();
  const id = customerIdSchema.parse(customerId);
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) throw new Error("Cliente no encontrado");
  if (customer.loyaltyCardStamps <= 0) return;
  await prisma.customer.update({ where: { id }, data: { loyaltyCardStamps: { decrement: 1 } } });
  revalidatePath(`/admin/clientes/${id}`);
  revalidatePath("/admin/fidelidad");
}

export async function redeemLoyaltyCard(customerId: string) {
  await requireAdmin();
  const id = customerIdSchema.parse(customerId);
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) throw new Error("Cliente no encontrado");
  if (customer.loyaltyCardStamps < LOYALTY_CARD_GOAL) {
    throw new Error("Todavía no llegó a los 6 sellos");
  }
  await prisma.customer.update({
    where: { id },
    data: { loyaltyCardStamps: 0, loyaltyCardRedemptions: { increment: 1 } },
  });
  revalidatePath(`/admin/clientes/${id}`);
  revalidatePath("/admin/fidelidad");
}
