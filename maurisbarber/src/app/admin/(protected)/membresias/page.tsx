import { prisma } from "@/lib/prisma";
import { MembershipsManager } from "@/components/admin/MembershipsManager";

export const dynamic = "force-dynamic";

export default async function MembresiasPage() {
  const [plans, sold] = await Promise.all([
    prisma.membershipPlan.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.customerMembership.findMany({
      include: { plan: true, customer: true },
      orderBy: { purchasedAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <MembershipsManager
      plans={plans.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: Number(p.price),
        credits: p.credits,
        validityDays: p.validityDays,
        active: p.active,
      }))}
      sold={sold.map((s) => ({
        id: s.id,
        planName: s.plan.name,
        customerName: `${s.customer.firstName} ${s.customer.lastName}`,
        remainingCredits: s.remainingCredits,
        expiresAt: s.expiresAt.toISOString().slice(0, 10),
      }))}
    />
  );
}
