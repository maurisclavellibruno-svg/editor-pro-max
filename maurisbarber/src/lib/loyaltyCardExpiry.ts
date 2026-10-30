import { prisma } from "@/lib/prisma";
import { LOYALTY_CARD_GOAL, LOYALTY_CARD_WINDOW_DAYS } from "@/lib/loyaltyCard";

// Customers mid-cycle (some stamps, not yet at the free cut) whose cycle
// started more than LOYALTY_CARD_WINDOW_DAYS ago lose their progress — they
// took too long between cuts. Meant to be called periodically (see
// instrumentation.ts), same pattern as the booking reminders/auto-complete.
export async function resetExpiredLoyaltyCards(): Promise<number> {
  const cutoff = new Date(Date.now() - LOYALTY_CARD_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const result = await prisma.customer.updateMany({
    where: {
      loyaltyCardEnrolled: true,
      loyaltyCardStamps: { gt: 0, lt: LOYALTY_CARD_GOAL },
      loyaltyCardCycleStartedAt: { lt: cutoff },
    },
    data: { loyaltyCardStamps: 0, loyaltyCardCycleStartedAt: null },
  });

  return result.count;
}
