"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { membershipPlanSchema, sellMembershipSchema } from "@/schemas/membership";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("No autorizado");
}

export async function upsertMembershipPlan(input: unknown) {
  await requireAdmin();
  const data = membershipPlanSchema.parse(input);

  const payload = {
    name: data.name,
    description: data.description ?? "",
    price: data.price,
    credits: data.credits,
    validityDays: data.validityDays,
    active: data.active,
  };

  if (data.id) {
    await prisma.membershipPlan.update({ where: { id: data.id }, data: payload });
  } else {
    await prisma.membershipPlan.create({ data: payload });
  }

  revalidatePath("/admin/membresias");
}

export async function deactivateMembershipPlan(id: string) {
  await requireAdmin();
  await prisma.membershipPlan.update({ where: { id }, data: { active: false } });
  revalidatePath("/admin/membresias");
}

export async function sellMembership(input: unknown) {
  await requireAdmin();
  const data = sellMembershipSchema.parse(input);

  const plan = await prisma.membershipPlan.findUnique({ where: { id: data.planId } });
  if (!plan || !plan.active) throw new Error("Plan no disponible");

  const customer = await prisma.customer.upsert({
    where: { phone: data.customerPhone },
    update: { firstName: data.firstName, lastName: data.lastName },
    create: { firstName: data.firstName, lastName: data.lastName, phone: data.customerPhone },
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + plan.validityDays);

  await prisma.$transaction([
    prisma.customerMembership.create({
      data: {
        customerId: customer.id,
        planId: plan.id,
        remainingCredits: plan.credits,
        expiresAt,
      },
    }),
    // The membership's full price is collected up front, so it counts as
    // income now (credits redeemed later don't generate additional income).
    prisma.transaction.create({
      data: {
        type: "INCOME",
        amount: plan.price,
        description: `Membresía "${plan.name}" — ${data.firstName} ${data.lastName}`,
        date: new Date(),
      },
    }),
  ]);

  revalidatePath("/admin/membresias");
  revalidatePath("/admin/estadisticas");
}
