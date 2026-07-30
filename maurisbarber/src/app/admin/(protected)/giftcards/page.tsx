import { prisma } from "@/lib/prisma";
import { GiftCardsManager } from "@/components/admin/GiftCardsManager";

export const dynamic = "force-dynamic";

export default async function GiftCardsPage() {
  const giftCards = await prisma.giftCard.findMany({
    include: { customer: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <GiftCardsManager
      giftCards={giftCards.map((g) => ({
        id: g.id,
        code: g.code,
        initialAmount: Number(g.initialAmount),
        remainingAmount: Number(g.remainingAmount),
        active: g.active,
        customerName: g.customer ? `${g.customer.firstName} ${g.customer.lastName}` : null,
        expiresAt: g.expiresAt ? g.expiresAt.toISOString().slice(0, 10) : null,
      }))}
    />
  );
}
