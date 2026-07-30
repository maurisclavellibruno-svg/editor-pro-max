import { prisma } from "@/lib/prisma";

// Simple accrual rule: 1 point per $100 spent. Kept as a single constant so
// it's easy to tune without hunting through the codebase.
export const POINTS_PER_100 = 1;

/**
 * Awards loyalty points for a booking's payment, exactly once (guarded by
 * Booking.pointsAwarded). Call this whenever a booking's paymentStatus
 * becomes PAID, regardless of payment method.
 */
export async function awardPointsForBooking(bookingId: string): Promise<void> {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.pointsAwarded || booking.paymentStatus !== "PAID") return;

  const points = Math.floor((Number(booking.price) / 100) * POINTS_PER_100);
  if (points <= 0) {
    await prisma.booking.update({ where: { id: bookingId }, data: { pointsAwarded: true } });
    return;
  }

  await prisma.$transaction([
    prisma.booking.update({ where: { id: bookingId }, data: { pointsAwarded: true } }),
    prisma.customer.update({
      where: { id: booking.customerId },
      data: { loyaltyPoints: { increment: points } },
    }),
  ]);
}
