"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/rate-limit";
import { LOYALTY_CARD_GOAL, LOYALTY_CARD_WINDOW_DAYS } from "@/lib/loyaltyCard";
import { joinLoyaltyCardSchema } from "@/schemas/loyaltyCard";

const WINDOW_MS = LOYALTY_CARD_WINDOW_DAYS * 24 * 60 * 60 * 1000;

// Shared by the manual "+1 sello" actions and the "¿vino hoy?" check-in —
// one place that knows the 2-month-cycle rule, so it can't drift between
// callers. Stamps 1-5 must land within LOYALTY_CARD_WINDOW_DAYS of the
// first one; if that window has lapsed, this stamp starts a fresh cycle
// instead of just tacking onto a stale one.
async function applyLoyaltyStamp(customerId: string) {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) throw new Error("Cliente no encontrado");
  if (customer.loyaltyCardStamps >= LOYALTY_CARD_GOAL) {
    throw new Error("Ya tiene el corte gratis disponible — canjealo antes de sumar otro sello");
  }

  const cycleExpired =
    customer.loyaltyCardCycleStartedAt !== null &&
    Date.now() - customer.loyaltyCardCycleStartedAt.getTime() > WINDOW_MS;

  const baseStamps = cycleExpired ? 0 : customer.loyaltyCardStamps;
  const startingFresh = baseStamps === 0;

  await prisma.customer.update({
    where: { id: customerId },
    data: {
      loyaltyCardStamps: baseStamps + 1,
      loyaltyCardCycleStartedAt: startingFresh ? new Date() : customer.loyaltyCardCycleStartedAt,
    },
  });
}

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
  await applyLoyaltyStamp(id);
  revalidatePath(`/admin/clientes/${id}`);
  revalidatePath("/admin/fidelidad");
}

export async function removeLoyaltyStamp(customerId: string) {
  await requireAdmin();
  const id = customerIdSchema.parse(customerId);
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) throw new Error("Cliente no encontrado");
  if (customer.loyaltyCardStamps <= 0) return;
  const newStamps = customer.loyaltyCardStamps - 1;
  await prisma.customer.update({
    where: { id },
    data: {
      loyaltyCardStamps: newStamps,
      // No stamps left means no cycle in progress either.
      loyaltyCardCycleStartedAt: newStamps === 0 ? null : customer.loyaltyCardCycleStartedAt,
    },
  });
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
    data: { loyaltyCardStamps: 0, loyaltyCardCycleStartedAt: null, loyaltyCardRedemptions: { increment: 1 } },
  });
  revalidatePath(`/admin/clientes/${id}`);
  revalidatePath("/admin/fidelidad");
}

const resolveCheckInSchema = z.object({
  bookingId: z.string().cuid(),
  attended: z.boolean(),
});

// Admin — answers the "¿vino hoy?" prompt for one booking. "Sí" adds a
// stamp (same 2-month-cycle rule as everywhere else); "No" just marks the
// prompt answered so it stops showing, with no other effect.
export async function resolveLoyaltyCheckIn(input: unknown) {
  await requireAdmin();
  const { bookingId, attended } = resolveCheckInSchema.parse(input);

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error("Turno no encontrado");
  if (booking.loyaltyPromptAnsweredAt) return; // already answered — idempotent

  await prisma.booking.update({ where: { id: bookingId }, data: { loyaltyPromptAnsweredAt: new Date() } });

  if (attended) {
    await applyLoyaltyStamp(booking.customerId);
  }

  revalidatePath("/admin", "layout");
  revalidatePath(`/admin/clientes/${booking.customerId}`);
  revalidatePath("/admin/fidelidad");
}
