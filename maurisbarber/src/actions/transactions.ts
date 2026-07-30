"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transactionSchema } from "@/schemas/transaction";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("No autorizado");
}

export async function createTransaction(input: unknown) {
  await requireAdmin();
  const data = transactionSchema.parse(input);

  await prisma.transaction.create({
    data: {
      type: data.type,
      amount: data.amount,
      method: data.method,
      description: data.description,
      date: new Date(data.date + "T00:00:00"),
    },
  });

  revalidatePath("/admin/estadisticas");
}

export async function deleteTransaction(id: string) {
  await requireAdmin();
  await prisma.transaction.delete({ where: { id } });
  revalidatePath("/admin/estadisticas");
}
