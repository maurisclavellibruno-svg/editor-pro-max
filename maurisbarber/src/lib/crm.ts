import { prisma } from "@/lib/prisma";

export interface CustomerStats {
  visitCount: number;
  totalSpent: number;
  lastVisitAt: Date | null;
}

// Visit stats are derived from Booking history rather than stored as
// counters on Customer, so they can never drift out of sync with the
// (immutable) booking history.
export async function getCustomerStats(customerId: string): Promise<CustomerStats> {
  const [completed, paidAgg] = await Promise.all([
    prisma.booking.aggregate({
      where: { customerId, status: "COMPLETED" },
      _count: { _all: true },
      _max: { startAt: true },
    }),
    prisma.booking.aggregate({
      where: { customerId, status: "COMPLETED", paymentStatus: "PAID" },
      _sum: { price: true },
    }),
  ]);

  return {
    visitCount: completed._count._all,
    totalSpent: Number(paidAgg._sum.price ?? 0),
    lastVisitAt: completed._max.startAt,
  };
}

export async function searchCustomers(query: string) {
  const customers = await prisma.customer.findMany({
    where: query
      ? {
          OR: [
            { firstName: { contains: query, mode: "insensitive" } },
            { lastName: { contains: query, mode: "insensitive" } },
            { phone: { contains: query } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  const withStats = await Promise.all(
    customers.map(async (customer) => ({
      ...customer,
      stats: await getCustomerStats(customer.id),
    })),
  );

  return withStats;
}

// Customers who've booked before (any status except CANCELLED — a booking
// that was simply never marked COMPLETED by staff still counts) but haven't
// booked again in at least `minDays` — the win-back list for the admin
// panel. Deliberately NOT based on getCustomerStats' COMPLETED-only
// lastVisitAt: staff rarely remembers to flip that status by hand, so that
// number alone made almost everyone look "inactive forever".
export async function getInactiveCustomers(minDays = 30) {
  const customers = await prisma.customer.findMany({ take: 300, orderBy: { updatedAt: "desc" } });
  const withLastBooking = await Promise.all(
    customers.map(async (customer) => {
      const last = await prisma.booking.aggregate({
        where: { customerId: customer.id, status: { not: "CANCELLED" } },
        _max: { startAt: true },
      });
      return { ...customer, lastBookingAt: last._max.startAt };
    }),
  );

  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;
  return withLastBooking
    .filter((c) => c.lastBookingAt && now - c.lastBookingAt.getTime() >= minDays * DAY_MS)
    .map((c) => ({
      ...c,
      daysSinceLastVisit: Math.floor((now - c.lastBookingAt!.getTime()) / DAY_MS),
    }))
    .sort((a, b) => b.daysSinceLastVisit - a.daysSinceLastVisit);
}

// Everyone enrolled in the loyalty punch card, for the quick-stamp admin view.
export async function getLoyaltyCardCustomers() {
  return prisma.customer.findMany({
    where: { loyaltyCardEnrolled: true },
    orderBy: [{ loyaltyCardStamps: "desc" }, { firstName: "asc" }],
  });
}

// Bookings for loyalty-enrolled customers whose time has passed and that
// staff hasn't answered "¿vino hoy?" for yet — drives the admin check-in
// prompt. Capped to a recent window so an old backlog (from before this
// feature existed, or someone who just turned on loyalty) doesn't flood it.
export async function getPendingLoyaltyCheckIns(limit = 20) {
  const now = new Date();
  const windowStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  return prisma.booking.findMany({
    where: {
      status: { not: "CANCELLED" },
      loyaltyPromptAnsweredAt: null,
      endAt: { lt: now, gte: windowStart },
      customer: { loyaltyCardEnrolled: true },
    },
    include: { customer: true, service: true },
    orderBy: { endAt: "asc" },
    take: limit,
  });
}

export async function getCustomerDetail(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      photos: { orderBy: { createdAt: "desc" } },
      bookings: {
        orderBy: { startAt: "desc" },
        include: { service: true },
      },
      memberships: {
        where: { remainingCredits: { gt: 0 }, expiresAt: { gt: new Date() } },
        include: { plan: true },
      },
      giftCards: { where: { active: true, remainingAmount: { gt: 0 } } },
    },
  });
  if (!customer) return null;

  const stats = await getCustomerStats(customerId);
  return { ...customer, stats };
}
