"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("No autorizado");
}

const redeemSchema = z.object({
  customerId: z.string().cuid(),
  points: z.coerce.number().int().min(1),
});

// Deducts points from a customer's balance. What the points are redeemed for
// (a discount, a free add-on, etc.) is decided by staff at the counter — this
// just keeps the balance accurate.
export async function redeemPoints(input: unknown) {
  await requireAdmin();
  const data = redeemSchema.parse(input);

  const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
  if (!customer) throw new Error("Cliente no encontrado");
  if (customer.loyaltyPoints < data.points) throw new Error("El cliente no tiene suficientes puntos");

  await prisma.customer.update({
    where: { id: data.customerId },
    data: { loyaltyPoints: { decrement: data.points } },
  });

  revalidatePath(`/admin/clientes/${data.customerId}`);
}
