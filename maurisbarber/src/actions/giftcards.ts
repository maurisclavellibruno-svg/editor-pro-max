"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { issueGiftCardSchema } from "@/schemas/giftcard";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("No autorizado");
}

function generateCode(): string {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `MB-${random}`;
}

export async function issueGiftCard(input: unknown) {
  await requireAdmin();
  const data = issueGiftCardSchema.parse(input);

  let customerId: string | null = null;
  if (data.customerPhone) {
    const customer = await prisma.customer.findUnique({ where: { phone: data.customerPhone } });
    customerId = customer?.id ?? null;
  }

  const code = generateCode();

  await prisma.$transaction([
    prisma.giftCard.create({
      data: {
        code,
        initialAmount: data.amount,
        remainingAmount: data.amount,
        customerId,
        expiresAt: data.expiresAt ? new Date(data.expiresAt + "T23:59:59") : null,
      },
    }),
    // The gift card's value is collected up front.
    prisma.transaction.create({
      data: {
        type: "INCOME",
        amount: data.amount,
        description: `Gift card emitida (${code})`,
        date: new Date(),
      },
    }),
  ]);

  revalidatePath("/admin/giftcards");
  revalidatePath("/admin/estadisticas");
  return { code };
}

export async function deactivateGiftCard(id: string) {
  await requireAdmin();
  await prisma.giftCard.update({ where: { id }, data: { active: false } });
  revalidatePath("/admin/giftcards");
}
